interface CommonResponse<T> {
    success: boolean
    error: string
    data: T
}

function buildUrl(path: string, data?: any): string {
    if (!data) return path
    const url = new URL(window.location.origin + path)
    for (const key in data) {
        url.searchParams.append(key, data[key])
    }
    return url.toString()
}

export enum FetcherMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export const AUTH_EXPIRED_EVENT = "nezha:auth-expired"

let latestRefreshTokenAt = 0

function notifyAuthExpired() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
}

function readCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined
    const prefix = `${encodeURIComponent(name)}=`
    const cookie = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(prefix))
    if (!cookie) return undefined
    try {
        return decodeURIComponent(cookie.slice(prefix.length))
    } catch {
        return undefined
    }
}

function shouldNotifyAuthExpired(path: string) {
    return new URL(path, window.location.origin).pathname !== "/api/v1/login"
}

async function refreshSession() {
    const csrfToken = readCookie("nz-csrf")
    const headers: Record<string, string> = {}
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken

    try {
        const response = await fetch("/api/v1/refresh-token", {
            method: FetcherMethod.POST,
            headers,
        })
        if (response.status === 401) {
            notifyAuthExpired()
            return
        }

        const responseData = (await response.json()) as CommonResponse<unknown>
        if (!responseData.success && responseData.error?.startsWith("ApiErrorUnauthorized")) {
            notifyAuthExpired()
        }
    } catch {
        latestRefreshTokenAt = 0
    }
}

export async function fetcher<T>(method: FetcherMethod, path: string, data?: any): Promise<T> {
    const actualMethod = method || FetcherMethod.GET
    let response
    if (actualMethod === FetcherMethod.GET) {
        response = await fetch(buildUrl(path, data), {
            method: actualMethod,
        })
    } else {
        const csrfToken = readCookie("nz-csrf")
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }
        if (csrfToken) headers["X-CSRF-Token"] = csrfToken
        response = await fetch(path, {
            method: actualMethod,
            headers,
            body: data ? JSON.stringify(data) : null,
        })
    }
    if (!response.ok) {
        if (response.status === 401 && shouldNotifyAuthExpired(path)) notifyAuthExpired()
        throw new Error(response.statusText)
    }
    const responseData: CommonResponse<T> = await response.json()
    if (!responseData.success) {
        if (
            responseData.error?.startsWith("ApiErrorUnauthorized") &&
            shouldNotifyAuthExpired(path)
        ) {
            notifyAuthExpired()
        }
        throw new Error(responseData.error)
    }

    // auto refresh token
    if (
        readCookie("nz-jwt") &&
        (!latestRefreshTokenAt || Date.now() - latestRefreshTokenAt > 1000 * 60 * 60)
    ) {
        latestRefreshTokenAt = Date.now()
        void refreshSession()
    }

    return responseData.data
}

export async function swrFetcher<T>(input: string | URL | globalThis.Request, init?: RequestInit) {
    return fetcher<T>(
        (init?.method as FetcherMethod) || FetcherMethod.GET,
        input.toString(),
        init?.body,
    )
}
