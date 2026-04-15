const BASE_URL = "http://192.168.0.16:5187"; // Expo Go på telefon

export async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
}