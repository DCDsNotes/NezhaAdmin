import { pb } from "./client"

type JsonRecord = Record<string, any>

const COLLECTIONS = {
    alertRules: import.meta.env.VITE_PB_ALERT_RULES_COLLECTION || "alert_rules",
    crons: import.meta.env.VITE_PB_CRONS_COLLECTION || "crons",
    ddnsProfiles: import.meta.env.VITE_PB_DDNS_COLLECTION || "ddns_profiles",
    frontendTemplates:
        import.meta.env.VITE_PB_FRONTEND_TEMPLATES_COLLECTION || "frontend_templates",
    nats: import.meta.env.VITE_PB_NAT_COLLECTION || "nats",
    notificationGroups:
        import.meta.env.VITE_PB_NOTIFICATION_GROUPS_COLLECTION || "notification_groups",
    notifications: import.meta.env.VITE_PB_NOTIFICATIONS_COLLECTION || "notifications",
    onlineUsers: import.meta.env.VITE_PB_ONLINE_USERS_COLLECTION || "online_users",
    serverConfigs: import.meta.env.VITE_PB_SERVER_CONFIGS_COLLECTION || "server_configs",
    serverGroups: import.meta.env.VITE_PB_SERVER_GROUPS_COLLECTION || "server_groups",
    servers: import.meta.env.VITE_PB_SERVERS_COLLECTION || "servers",
    services: import.meta.env.VITE_PB_SERVICES_COLLECTION || "services",
    settings: import.meta.env.VITE_PB_SETTINGS_COLLECTION || "app_settings",
    users: import.meta.env.VITE_PB_USERS_COLLECTION || "users",
    waf: import.meta.env.VITE_PB_WAF_COLLECTION || "waf_blocks",
} as const

const DEFAULT_SETTINGS = {
    admin_template: "",
    agent_real_ip_header: "",
    cover: 1,
    custom_code: "",
    custom_code_dashboard: "",
    dns_servers: "",
    enable_ip_change_notification: false,
    enable_plain_ip_in_notification: false,
    ignored_ip_notification: "",
    ignored_ip_notification_server_ids: {},
    install_host: "",
    ip_change_notification_group_id: 0,
    language: "en-US",
    oauth2_providers: [],
    site_name: "Nezha Dashboard",
    tls: false,
    user_template: "user-dist",
    web_real_ip_header: "",
}

const DEFAULT_DDNS_PROVIDERS = ["dummy", "webhook", "cloudflare", "dnspod", "alidns"]

function toNumber(value: unknown, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function escapeFilterValue(value: string) {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}

function mapRecord(record?: JsonRecord | null) {
    if (!record) {
        return null
    }

    const pbId = record.id
    const normalized: JsonRecord = {
        ...record,
        id: toNumber(record.legacy_id, typeof record.id === "number" ? record.id : 0),
        created_at: record.created_at || record.created,
        updated_at: record.updated_at || record.updated,
        pb_id: pbId,
    }

    delete normalized.collectionId
    delete normalized.collectionName
    delete normalized.created
    delete normalized.updated
    delete normalized.expand
    delete normalized.legacy_id

    return normalized
}

function mapTemplate(record?: JsonRecord | null) {
    if (!record) {
        return null
    }

    const normalized = {
        ...record,
    }

    delete normalized.id
    delete normalized.collectionId
    delete normalized.collectionName
    delete normalized.created
    delete normalized.updated
    delete normalized.expand
    delete normalized.legacy_id

    return normalized
}

async function getNextLegacyId(collection: string) {
    const latest = await pb.collection(collection).getList(1, 1, {
        fields: "legacy_id",
        sort: "-legacy_id",
    })

    return toNumber(latest.items[0]?.legacy_id, 0) + 1
}

async function getRecordByLegacyId(collection: string, legacyId: number) {
    const result = await pb.collection(collection).getList(1, 1, {
        filter: `legacy_id=${legacyId}`,
    })

    const record = result.items[0]
    if (!record) {
        throw new Error(`Record ${legacyId} not found in ${collection}`)
    }

    return record as JsonRecord
}

async function listCollection(collection: string, sort = "-updated") {
    const items = await pb.collection(collection).getFullList({ sort })
    return items.map((item) => mapRecord(item as JsonRecord))
}

async function createCollectionRecord(collection: string, data: JsonRecord) {
    const legacyId = await getNextLegacyId(collection)
    await pb.collection(collection).create({
        legacy_id: legacyId,
        ...data,
    })
    return legacyId
}

async function updateCollectionRecord(collection: string, legacyId: number, data: JsonRecord) {
    const record = await getRecordByLegacyId(collection, legacyId)
    await pb.collection(collection).update(record.id, data)
}

async function deleteCollectionRecords(collection: string, legacyIds: number[]) {
    await Promise.all(
        legacyIds.map(async (legacyId) => {
            const record = await getRecordByLegacyId(collection, legacyId)
            await pb.collection(collection).delete(record.id)
        }),
    )
}

async function deleteCollectionRecordsByField(collection: string, field: string, values: string[]) {
    await Promise.all(
        values.map(async (value) => {
            const result = await pb.collection(collection).getList(1, 1, {
                filter: `${field}='${escapeFilterValue(value)}'`,
            })

            const record = result.items[0] as JsonRecord | undefined
            if (record) {
                await pb.collection(collection).delete(record.id)
            }
        }),
    )
}

async function getSettingsRecord() {
    try {
        const result = await pb.collection(COLLECTIONS.settings).getList(1, 1)
        return (result.items[0] as JsonRecord | undefined) || null
    } catch {
        return null
    }
}

async function getCurrentUserRecord() {
    if (!pb.authStore.isValid || !pb.authStore.record) {
        throw new Error("Unauthorized")
    }

    return pb.authStore.record as JsonRecord
}

async function getProfile() {
    if (!pb.authStore.isValid) {
        throw new Error("Unauthorized")
    }

    const refreshed = await pb.collection(COLLECTIONS.users).authRefresh()
    const profile = mapRecord((refreshed.record || pb.authStore.record) as JsonRecord)

    return {
        ...profile,
        agent_secret: profile?.agent_secret || "",
        login_ip: profile?.login_ip || "",
        oauth2_bind: profile?.oauth2_bind || {},
        password: "",
        reject_password: Boolean(profile?.reject_password),
        role: toNumber(profile?.role),
    }
}

async function login(data?: JsonRecord) {
    const username = data?.username
    const password = data?.password

    if (!username || !password) {
        throw new Error("InvalidUsernameOrPassword")
    }

    await pb.collection(COLLECTIONS.users).authWithPassword(username, password)

    const current = await getCurrentUserRecord()
    await pb.collection(COLLECTIONS.users).update(current.id, {
        login_ip: window.location.hostname,
    })
}

async function listUsers() {
    const users = await listCollection(COLLECTIONS.users)
    return users.map((user) => ({
        ...user,
        agent_secret: user?.agent_secret || "",
        password: "",
        reject_password: Boolean(user?.reject_password),
        role: toNumber(user?.role),
    }))
}

async function createUser(data?: JsonRecord) {
    const legacyId = await getNextLegacyId(COLLECTIONS.users)
    await pb.collection(COLLECTIONS.users).create({
        legacy_id: legacyId,
        username: data?.username,
        password: data?.password,
        passwordConfirm: data?.password,
        role: toNumber(data?.role, 1),
        reject_password: false,
        oauth2_bind: {},
        agent_secret: "",
    })
    return legacyId
}

async function updateProfile(data?: JsonRecord) {
    const current = await getCurrentUserRecord()

    await pb.collection(COLLECTIONS.users).authWithPassword(
        current.username,
        data?.original_password || "",
    )

    const nextUsername = data?.new_username || current.username
    const nextPassword = data?.new_password

    const payload: JsonRecord = {
        username: nextUsername,
        reject_password: Boolean(data?.reject_password),
    }

    if (nextPassword) {
        payload.password = nextPassword
        payload.passwordConfirm = nextPassword
    }

    await pb.collection(COLLECTIONS.users).update(current.id, payload)
    await pb.collection(COLLECTIONS.users).authWithPassword(
        nextUsername,
        nextPassword || data?.original_password || "",
    )
}

async function getSettings() {
    const [settingsRecord, frontendTemplates] = await Promise.all([
        getSettingsRecord(),
        pb.collection(COLLECTIONS.frontendTemplates)
            .getFullList({ sort: "name" })
            .then((items) => items.map((item) => mapTemplate(item as JsonRecord)))
            .catch(() => []),
    ])

    const config = settingsRecord
        ? {
              ...DEFAULT_SETTINGS,
              ...settingsRecord,
          }
        : DEFAULT_SETTINGS

    return {
        config,
        frontend_templates: frontendTemplates,
        version: (config as JsonRecord).version || "PocketBase",
    }
}

async function updateSettings(data?: JsonRecord) {
    const settingsRecord = await getSettingsRecord()

    if (settingsRecord) {
        await pb.collection(COLLECTIONS.settings).update(settingsRecord.id, data || {})
        return
    }

    await pb.collection(COLLECTIONS.settings).create({
        ...DEFAULT_SETTINGS,
        ...(data || {}),
    })
}

async function getNotificationGroups() {
    const items = await pb.collection(COLLECTIONS.notificationGroups).getFullList({ sort: "name" })
    return items.map((item) => {
        const group = mapRecord(item as JsonRecord)
        return {
            group,
            notifications: (item as JsonRecord).notifications || [],
        }
    })
}

async function getServerGroups() {
    const items = await pb.collection(COLLECTIONS.serverGroups).getFullList({ sort: "name" })
    return items.map((item) => {
        const group = mapRecord(item as JsonRecord)
        return {
            group,
            servers: (item as JsonRecord).servers || [],
        }
    })
}

async function getDDNSProviders() {
    const profiles = await listCollection(COLLECTIONS.ddnsProfiles)
    const providers = new Set<string>(DEFAULT_DDNS_PROVIDERS)

    profiles.forEach((profile) => {
        if (profile?.provider) {
            providers.add(profile.provider)
        }
    })

    return [...providers]
}

async function batchMoveServer(data?: JsonRecord) {
    const ids = Array.isArray(data?.ids) ? data.ids.map((id) => toNumber(id)) : []
    const toUser = toNumber(data?.to_user)

    await Promise.all(
        ids.map(async (legacyId) => {
            const record = await getRecordByLegacyId(COLLECTIONS.servers, legacyId)
            await pb.collection(COLLECTIONS.servers).update(record.id, { user_id: toUser })
        }),
    )
}

async function forceUpdateServer(data?: unknown) {
    const ids = Array.isArray(data) ? data.map((id) => toNumber(id)) : []
    return {
        success: ids,
        failure: [],
        offline: [],
    }
}

async function getServerConfig(legacyId: number) {
    const result = await pb.collection(COLLECTIONS.serverConfigs).getList(1, 1, {
        filter: `server_legacy_id=${legacyId}`,
    })

    return (result.items[0] as JsonRecord | undefined)?.config || ""
}

async function setServerConfig(data?: JsonRecord) {
    const servers = Array.isArray(data?.servers) ? data.servers.map((id) => toNumber(id)) : []
    const config = data?.config || ""

    await Promise.all(
        servers.map(async (legacyId) => {
            const existing = await pb.collection(COLLECTIONS.serverConfigs).getList(1, 1, {
                filter: `server_legacy_id=${legacyId}`,
            })

            const record = existing.items[0] as JsonRecord | undefined
            if (record) {
                await pb.collection(COLLECTIONS.serverConfigs).update(record.id, { config })
                return
            }

            await pb.collection(COLLECTIONS.serverConfigs).create({
                server_legacy_id: legacyId,
                config,
            })
        }),
    )

    return {
        success: servers,
        failure: [],
        offline: [],
    }
}

async function runCron(legacyId: number) {
    const record = await getRecordByLegacyId(COLLECTIONS.crons, legacyId)
    await pb.collection(COLLECTIONS.crons).update(record.id, {
        last_executed_at: new Date().toISOString(),
        last_result: true,
    })
}

async function buildPaginatedResponse(collection: string, offset: number, limit: number) {
    const page = Math.floor(offset / limit) + 1
    const response = await pb.collection(collection).getList(page, limit, {
        sort: "-updated",
    })

    return {
        value: response.items.map((item) => mapRecord(item as JsonRecord)),
        pagination: {
            total: response.totalItems,
            offset,
            limit,
        },
    }
}

async function blockUser(ips: string[]) {
    await Promise.all(
        ips.map(async (ip) => {
            const existing = await pb.collection(COLLECTIONS.waf).getList(1, 1, {
                filter: `ip='${escapeFilterValue(ip)}'`,
            })

            const current = existing.items[0] as JsonRecord | undefined
            if (current) {
                await pb.collection(COLLECTIONS.waf).update(current.id, {
                    count: toNumber(current.count, 0) + 1,
                    block_identifier: -124,
                    block_reason: 4,
                    block_timestamp: Math.floor(Date.now() / 1000),
                })
            } else {
                await pb.collection(COLLECTIONS.waf).create({
                    ip,
                    count: 1,
                    block_identifier: -124,
                    block_reason: 4,
                    block_timestamp: Math.floor(Date.now() / 1000),
                })
            }
        }),
    )

    await deleteCollectionRecordsByField(COLLECTIONS.onlineUsers, "ip", ips)
}

function getResourceCollection(resource: string) {
    switch (resource) {
        case "alert-rule":
            return COLLECTIONS.alertRules
        case "cron":
            return COLLECTIONS.crons
        case "ddns":
            return COLLECTIONS.ddnsProfiles
        case "nat":
            return COLLECTIONS.nats
        case "notification":
            return COLLECTIONS.notifications
        case "service":
            return COLLECTIONS.services
        case "server":
            return COLLECTIONS.servers
        default:
            return null
    }
}

async function createTerminal() {
    throw new Error("PocketBase transport for terminal is not implemented yet")
}

async function createFM() {
    throw new Error("PocketBase transport for file manager is not implemented yet")
}

async function getOauth2RedirectURL() {
    throw new Error("PocketBase OAuth2 redirect flow is not implemented in this compatibility layer")
}

async function unbindOauth2(provider: string) {
    const current = await getCurrentUserRecord()
    const oauth2Bind = {
        ...(current.oauth2_bind || {}),
    }

    delete oauth2Bind[provider.toLowerCase()]

    await pb.collection(COLLECTIONS.users).update(current.id, {
        oauth2_bind: oauth2Bind,
    })

    return {
        redirect: "",
    }
}

export async function handlePocketBaseRequest<T>(
    method: string,
    path: string,
    data?: unknown,
): Promise<T> {
    const url = new URL(path, window.location.origin)
    const pathname = url.pathname

    if (pathname === "/api/v1/profile") {
        if (method === "GET") {
            return (await getProfile()) as T
        }

        if (method === "POST") {
            await updateProfile(data as JsonRecord)
            return undefined as T
        }
    }

    if (pathname === "/api/v1/login" && method === "POST") {
        await login(data as JsonRecord)
        return undefined as T
    }

    if (pathname === "/api/v1/user") {
        if (method === "GET") {
            return (await listUsers()) as T
        }

        if (method === "POST") {
            return (await createUser(data as JsonRecord)) as T
        }
    }

    if (pathname === "/api/v1/setting") {
        if (method === "GET") {
            return (await getSettings()) as T
        }

        if (method === "PATCH") {
            await updateSettings(data as JsonRecord)
            return undefined as T
        }
    }

    if (pathname === "/api/v1/notification-group") {
        if (method === "GET") {
            return (await getNotificationGroups()) as T
        }

        if (method === "POST") {
            return (await createCollectionRecord(COLLECTIONS.notificationGroups, data as JsonRecord)) as T
        }
    }

    if (pathname === "/api/v1/server-group") {
        if (method === "GET") {
            return (await getServerGroups()) as T
        }

        if (method === "POST") {
            return (await createCollectionRecord(COLLECTIONS.serverGroups, data as JsonRecord)) as T
        }
    }

    if (pathname === "/api/v1/ddns/providers" && method === "GET") {
        return (await getDDNSProviders()) as T
    }

    if (pathname === "/api/v1/batch-move/server" && method === "POST") {
        await batchMoveServer(data as JsonRecord)
        return undefined as T
    }

    if (pathname === "/api/v1/force-update/server" && method === "POST") {
        return (await forceUpdateServer(data)) as T
    }

    if (pathname === "/api/v1/server/config" && method === "POST") {
        return (await setServerConfig(data as JsonRecord)) as T
    }

    if (pathname === "/api/v1/terminal" && method === "POST") {
        return (await createTerminal()) as T
    }

    if (pathname === "/api/v1/file" && method === "GET") {
        return (await createFM()) as T
    }

    if (pathname === "/api/v1/service/list" && method === "GET") {
        return (await listCollection(COLLECTIONS.services)) as T
    }

    if (pathname === "/api/v1/online-user" && method === "GET") {
        const offset = toNumber(url.searchParams.get("offset"), 0)
        const limit = toNumber(url.searchParams.get("limit"), 10)
        return (await buildPaginatedResponse(COLLECTIONS.onlineUsers, offset, limit)) as T
    }

    if (pathname === "/api/v1/waf" && method === "GET") {
        const offset = toNumber(url.searchParams.get("offset"), 0)
        const limit = toNumber(url.searchParams.get("limit"), 10)
        return (await buildPaginatedResponse(COLLECTIONS.waf, offset, limit)) as T
    }

    if (pathname === "/api/v1/online-user/batch-block" && method === "POST") {
        await blockUser(Array.isArray(data) ? data.map(String) : [])
        return undefined as T
    }

    if (pathname.startsWith("/api/v1/oauth2/")) {
        const provider = pathname.replace("/api/v1/oauth2/", "").replace("/unbind", "")

        if (pathname.endsWith("/unbind") && method === "POST") {
            return (await unbindOauth2(provider)) as T
        }

        if (method === "GET") {
            return (await getOauth2RedirectURL()) as T
        }
    }

    const serverConfigMatch = pathname.match(/^\/api\/v1\/server\/config\/(\d+)$/)
    if (serverConfigMatch && method === "GET") {
        return (await getServerConfig(toNumber(serverConfigMatch[1]))) as T
    }

    const cronManualMatch = pathname.match(/^\/api\/v1\/cron\/(\d+)\/manual$/)
    if (cronManualMatch && method === "GET") {
        await runCron(toNumber(cronManualMatch[1]))
        return undefined as T
    }

    const batchDeleteMatch = pathname.match(/^\/api\/v1\/batch-delete\/(.+)$/)
    if (batchDeleteMatch && method === "POST") {
        const resource = batchDeleteMatch[1]

        if (resource === "notification-group") {
            await deleteCollectionRecords(
                COLLECTIONS.notificationGroups,
                Array.isArray(data) ? data.map((id) => toNumber(id)) : [],
            )
            return undefined as T
        }

        if (resource === "server-group") {
            await deleteCollectionRecords(
                COLLECTIONS.serverGroups,
                Array.isArray(data) ? data.map((id) => toNumber(id)) : [],
            )
            return undefined as T
        }

        if (resource === "user") {
            await deleteCollectionRecords(
                COLLECTIONS.users,
                Array.isArray(data) ? data.map((id) => toNumber(id)) : [],
            )
            return undefined as T
        }

        if (resource === "waf") {
            await deleteCollectionRecordsByField(
                COLLECTIONS.waf,
                "ip",
                Array.isArray(data) ? data.map(String) : [],
            )
            return undefined as T
        }

        const collection = getResourceCollection(resource)
        if (collection) {
            await deleteCollectionRecords(collection, Array.isArray(data) ? data.map((id) => toNumber(id)) : [])
            return undefined as T
        }
    }

    const updateMatch = pathname.match(
        /^\/api\/v1\/(alert-rule|cron|ddns|nat|notification-group|notification|server-group|server|service)\/(\d+)$/,
    )
    if (updateMatch && method === "PATCH") {
        const resource = updateMatch[1]
        const legacyId = toNumber(updateMatch[2])

        if (resource === "notification-group") {
            await updateCollectionRecord(COLLECTIONS.notificationGroups, legacyId, data as JsonRecord)
            return undefined as T
        }

        if (resource === "server-group") {
            await updateCollectionRecord(COLLECTIONS.serverGroups, legacyId, data as JsonRecord)
            return undefined as T
        }

        const collection = getResourceCollection(resource)
        if (collection) {
            await updateCollectionRecord(collection, legacyId, data as JsonRecord)
            return undefined as T
        }
    }

    const collection = getResourceCollection(pathname.replace("/api/v1/", ""))
    if (collection && method === "GET") {
        return (await listCollection(collection)) as T
    }

    if (collection && method === "POST") {
        return (await createCollectionRecord(collection, data as JsonRecord)) as T
    }

    throw new Error(`Unsupported PocketBase endpoint: ${method} ${pathname}`)
}
