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

let lastestRefreshTokenAt = 0

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
    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined
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
        if (response.status === 401) notifyAuthExpired()
        throw new Error(response.statusText)
    }
    const responseData: CommonResponse<T> = await response.json()
    if (!responseData.success) {
        if (responseData.error?.startsWith("ApiErrorUnauthorized")) notifyAuthExpired()
        throw new Error(responseData.error)
    }

    // auto refresh token
    if (
        document.cookie &&
        (!lastestRefreshTokenAt || Date.now() - lastestRefreshTokenAt > 1000 * 60 * 60)
    ) {
        lastestRefreshTokenAt = Date.now()
        fetch("/api/v1/refresh-token")
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
