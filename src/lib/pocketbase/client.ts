import PocketBase from "pocketbase"

const fallbackUrl =
    typeof window === "undefined"
        ? "http://127.0.0.1:8090"
        : `${window.location.protocol}//${window.location.hostname}:8090`

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || fallbackUrl)

pb.autoCancellation(false)

export function clearPocketBaseAuth() {
    pb.authStore.clear()
}
