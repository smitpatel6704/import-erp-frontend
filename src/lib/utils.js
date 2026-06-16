import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export async function readJsonResponse(response) {
    const text = await response.text();
    if (!text)
        return {};
    try {
        return JSON.parse(text);
    }
    catch {
        throw new Error(response.ok ? "Server returned an invalid response" : text);
    }
}

export const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
