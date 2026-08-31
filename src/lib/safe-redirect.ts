export function getSafeHttpRedirect(redirect: string | undefined) {
    if (!redirect) throw new Error("Invalid redirect URL")

    const url = new URL(redirect, window.location.origin)
    if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("Invalid redirect URL")
    }

    return url.toString()
}
