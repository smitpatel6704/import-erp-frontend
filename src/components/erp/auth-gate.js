"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useERPStore } from "@/lib/store";

export function AuthGate({ children }) {
    const router = useRouter();
    const params = useParams();
    const routeModule = params?.module ? (Array.isArray(params.module) ? params.module[0] : params.module) : "dashboard";
    const { token, authReady, initializeAuth, refreshCurrentUser } = useERPStore();
    const patched = useRef(false);
    useEffect(() => {
        initializeAuth();
        if (patched.current)
            return;
        patched.current = true;
        const originalFetch = window.fetch.bind(window);
        const authenticatedFetch = async (input, init = {}) => {
            const url = typeof input === "string"
                ? input
                : input instanceof URL
                    ? input.href
                    : typeof input?.url === "string"
                        ? input.url
                        : "";
            const isApi = url.startsWith("/api") || url.includes("/api/");
            if (!isApi)
                return originalFetch(input, init);
            const publicAuthPaths = [
                "/api/auth/status",
                "/api/auth/login",
                "/api/auth/verify-email-otp",
                "/api/auth/bootstrap",
                "/api/auth/invitation",
                "/api/auth/setup-password",
            ];
            const isPublicAuth = publicAuthPaths.some((path) => url.includes(path));
            const currentToken = useERPStore.getState().token;
            const headers = new Headers(init.headers || input?.headers);
            if (currentToken && !isPublicAuth)
                headers.set("Authorization", `Bearer ${currentToken}`);
            const requestInit = Object.assign(Object.assign({}, init), { headers });
            const method = String(requestInit.method || input?.method || "GET").toUpperCase();
            const retryable = method === "GET" || method === "HEAD";
            let response;
            let lastError;
            for (let attempt = 0; attempt < (retryable ? 3 : 1); attempt += 1) {
                if (attempt > 0)
                    await new Promise((resolve) => window.setTimeout(resolve, attempt * 500));
                try {
                    response = await originalFetch(input, requestInit);
                    if (!retryable || response.status < 500)
                        break;
                }
                catch (error) {
                    lastError = error;
                    if (!retryable || attempt === 2)
                        throw error;
                }
            }
            if (!response)
                throw lastError || new Error("Unable to reach the server");
            if (response.status === 401 && !isPublicAuth) {
                useERPStore.getState().logout();
                router.replace("/login");
            }
            return response;
        };
        window.fetch = authenticatedFetch;
        return () => {
            if (window.fetch === authenticatedFetch)
                window.fetch = originalFetch;
            patched.current = false;
        };
    }, [initializeAuth, router]);
    useEffect(() => {
        if (!authReady || !token)
            return;
        let stopped = false;
        let refreshing = false;
        const refreshSessionUser = async () => {
            if (stopped || refreshing)
                return;
            refreshing = true;
            try {
                await refreshCurrentUser();
            }
            catch {
                // Keep the current session during temporary network interruptions.
            }
            finally {
                refreshing = false;
            }
        };
        const refreshWhenVisible = () => {
            if (document.visibilityState === "visible")
                refreshSessionUser();
        };
        refreshSessionUser();
        const interval = window.setInterval(refreshSessionUser, 3000);
        window.addEventListener("focus", refreshSessionUser);
        document.addEventListener("visibilitychange", refreshWhenVisible);
        return () => {
            stopped = true;
            window.clearInterval(interval);
            window.removeEventListener("focus", refreshSessionUser);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
        };
    }, [authReady, token, refreshCurrentUser]);
    useEffect(() => {
        if (!authReady)
            return;
        const publicRoute = routeModule === "login" || routeModule === "setup-password";
        if (!token && !publicRoute)
            router.replace("/login");
        if (token && routeModule === "login")
            router.replace("/dashboard");
    }, [authReady, token, routeModule, router]);
    if (!authReady)
        return _jsx("div", { className: "flex h-screen items-center justify-center text-sm text-muted-foreground", children: "Loading..." });
    return children;
}
