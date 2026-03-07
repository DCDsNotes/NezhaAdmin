import { handlePocketBaseRequest } from "@/lib/pocketbase/compat"

export enum FetcherMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export async function fetcher<T>(method: FetcherMethod, path: string, data?: any): Promise<T> {
    const actualMethod = method || FetcherMethod.GET

    if (actualMethod === FetcherMethod.GET && data && typeof data === "object") {
        const url = new URL(path, window.location.origin)
        Object.entries(data).forEach(([key, value]) => {
            url.searchParams.set(key, String(value))
        })
        return handlePocketBaseRequest<T>(actualMethod, url.toString())
    }

    return handlePocketBaseRequest<T>(actualMethod, path, data)
}

export async function swrFetcher<T>(input: string | URL | globalThis.Request, init?: RequestInit) {
    const method = (init?.method as FetcherMethod) || FetcherMethod.GET
    return fetcher<T>(method, input.toString(), init?.body)
}
