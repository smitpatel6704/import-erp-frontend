import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export const API_BASE_URL = (process.env.BACKEND_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '')).replace(/\/$/, '');
