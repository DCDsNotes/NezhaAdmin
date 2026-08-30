export const DEFAULT_SITE_NAME = "节点监控"

export function resolveSiteName(siteName?: string) {
    return siteName?.trim() || DEFAULT_SITE_NAME
}
