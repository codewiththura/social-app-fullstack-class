export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function authFetch(endpoint, options = {}) {
    let token = localStorage.getItem("token");

    const headers = {
        ...options.headers
    }

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json"
    }

    if (token) {
        token = token.replace(/^'(.*)"$/, "$1")
        headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(endpoint, {
        ...options,
        headers
    })

    return response
}