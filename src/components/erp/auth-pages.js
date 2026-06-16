"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Anchor, KeyRound, LogIn } from "lucide-react";
import { useERPStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AuthShell = ({ title, description, children }) => (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 p-4", children: _jsxs(Card, { className: "w-full max-w-md shadow-enterprise", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10", children: _jsx(Anchor, { className: "h-6 w-6 text-teal" }) }), _jsx(CardTitle, { children: title }), _jsx(CardDescription, { children: description })] }), _jsx(CardContent, { children })] }) }));

export function LoginPage() {
    const router = useRouter();
    const setAuth = useERPStore((state) => state.setAuth);
    const [needsBootstrap, setNeedsBootstrap] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [otpForm, setOtpForm] = useState({ code: "" });
    const [otpChallenge, setOtpChallenge] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetch("/api/auth/status").then((res) => res.json()).then((json) => setNeedsBootstrap(Boolean(json.data?.needsBootstrap))).catch(() => setError("Unable to reach the server"));
    }, []);
    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(needsBootstrap ? "/api/auth/bootstrap" : "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error || "Login failed");
            if (json.data?.otpRequired) {
                setOtpChallenge(json.data);
                setOtpForm({ code: "" });
                return;
            }
            setAuth(json.data.user, json.data.token);
            router.replace("/dashboard");
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    const verifyOtp = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/verify-email-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otpToken: otpChallenge?.otpToken, code: otpForm.code }),
            });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error || "OTP verification failed");
            setAuth(json.data.user, json.data.token);
            router.replace("/dashboard");
        }
        catch (err) {
            setError(err.message || "Invalid OTP");
        }
        finally {
            setLoading(false);
        }
    };
    const passwordForm = _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [needsBootstrap && _jsxs("div", { children: [_jsx(Label, { children: "Full Name" }), _jsx(Input, { value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { name: e.target.value })), required: true, className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Email" }), _jsx(Input, { type: "email", value: form.email, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { email: e.target.value })), required: true, className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Password" }), _jsx(Input, { type: "password", minLength: 8, value: form.password, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { password: e.target.value })), required: true, className: "mt-1" })] }), error && _jsx("p", { className: "text-sm text-destructive", children: error }), _jsxs(Button, { type: "submit", className: "w-full", disabled: loading, children: [_jsx(LogIn, { className: "mr-2 h-4 w-4" }), loading ? "Please wait..." : needsBootstrap ? "Create Admin" : "Sign In"] })] });
    const otpLoginForm = _jsxs("form", { onSubmit: verifyOtp, className: "space-y-4", children: [_jsxs("div", { className: "rounded-lg border border-border/60 bg-muted/30 p-3 text-sm", children: [_jsx("p", { className: "font-medium", children: "Password verified" }), _jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: ["Enter the 6 digit OTP sent to ", otpChallenge?.maskedEmail || "your email", "."] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Email OTP" }), _jsx(Input, { inputMode: "numeric", pattern: "[0-9]{6}", maxLength: 6, value: otpForm.code, onChange: (e) => setOtpForm({ code: e.target.value.replace(/\\D/g, "").slice(0, 6) }), required: true, className: "mt-1", autoFocus: true })] }), error && _jsx("p", { className: "text-sm text-destructive", children: error }), _jsxs(Button, { type: "submit", className: "w-full", disabled: loading, children: [_jsx(LogIn, { className: "mr-2 h-4 w-4" }), loading ? "Please wait..." : "Verify OTP & Login"] }), _jsx(Button, { type: "button", variant: "ghost", className: "w-full", onClick: () => {
                    setOtpChallenge(null);
                    setOtpForm({ code: "" });
                    setError("");
                }, children: "Back to password" })] });
    return _jsx(AuthShell, { title: needsBootstrap ? "Create Admin Account" : "Secure sign in", description: needsBootstrap ? "Set up the first administrator account" : otpChallenge ? "Step 2 of 2: verify email OTP" : "Step 1 of 2: verify your password", children: otpChallenge ? otpLoginForm : passwordForm });
}

export function SetupPasswordPage() {
    const params = useSearchParams();
    const router = useRouter();
    const setAuth = useERPStore((state) => state.setAuth);
    const token = params.get("token") || "";
    const [invitation, setInvitation] = useState(null);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    useEffect(() => {
        fetch(`/api/auth/invitation?token=${encodeURIComponent(token)}`).then(async (res) => {
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error);
            setInvitation(json.data);
        }).catch((err) => setError(err.message));
    }, [token]);
    const submit = async (event) => {
        event.preventDefault();
        if (password !== confirm)
            return setError("Passwords do not match");
        const res = await fetch("/api/auth/setup-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });
        const json = await res.json();
        if (!res.ok)
            return setError(json.error || "Unable to create password");
        setAuth(json.data.user, json.data.token);
        router.replace("/dashboard");
    };
    return _jsx(AuthShell, { title: "Create Your Password", description: invitation ? `${invitation.name} · ${invitation.email}` : "Validate your invitation link", children: _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "New Password" }), _jsx(Input, { type: "password", minLength: 8, value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: !invitation, className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Confirm Password" }), _jsx(Input, { type: "password", minLength: 8, value: confirm, onChange: (e) => setConfirm(e.target.value), required: true, disabled: !invitation, className: "mt-1" })] }), error && _jsx("p", { className: "text-sm text-destructive", children: error }), _jsxs(Button, { type: "submit", className: "w-full", disabled: !invitation, children: [_jsx(KeyRound, { className: "mr-2 h-4 w-4" }), "Create Password"] })] }) });
}
