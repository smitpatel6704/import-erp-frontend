"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useERPStore } from "@/lib/store";

export function AuthGate({ children }) {
    const router = useRouter();
    const params = useParams();
    const routeModule = params?.module ? (Array.isArray(params.module) ? params.module[0] : params.module) : "dashboard";
    const { token, authReady, initializeAuth, setCurrentUser } = useERPStore();
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
                "/api/auth/bootstrap",
                "/api/auth/invitation",
                "/api/auth/setup-password",
            ];
            const isPublicAuth = publicAuthPaths.some((path) => url.includes(path));
            const currentToken = useERPStore.getState().token;
            const headers = new Headers(init.headers || input?.headers);
            if (currentToken && !isPublicAuth)
                headers.set("Authorization", `Bearer ${currentToken}`);
            const response = await originalFetch(input, Object.assign(Object.assign({}, init), { headers }));
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
        const refreshCurrentUser = async () => {
            if (stopped || refreshing)
                return;
            refreshing = true;
            try {
                const response = await window.fetch("/api/auth/me", {
                    cache: "no-store",
                });
                if (!response.ok)
                    return;
                const json = await response.json();
                if (!stopped && json.data)
                    setCurrentUser(json.data);
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
                refreshCurrentUser();
        };
        refreshCurrentUser();
        const interval = window.setInterval(refreshCurrentUser, 3000);
        window.addEventListener("focus", refreshCurrentUser);
        document.addEventListener("visibilitychange", refreshWhenVisible);
        return () => {
            stopped = true;
            window.clearInterval(interval);
            window.removeEventListener("focus", refreshCurrentUser);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
        };
    }, [authReady, token, setCurrentUser]);
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
