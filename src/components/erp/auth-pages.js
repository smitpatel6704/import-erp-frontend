"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Anchor,
  KeyRound,
  LogIn,
  Ship,
  ShieldCheck,
  Sparkles,
  Globe2,
  CheckCircle2,
} from "lucide-react";
import { useERPStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── Split-screen shell ───────────────────────────────────────── */

const brandFeatures = [
  { icon: Ship, label: "Shipment lifecycle tracking" },
  { icon: Globe2, label: "Global port & customs data" },
  { icon: ShieldCheck, label: "Enterprise-grade access control" },
];

function AuthShell({ title, description, badge, children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="ambient-orbs" aria-hidden="true" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Brand panel */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative hidden lg:flex flex-col justify-between overflow-hidden sidebar-gradient p-10 text-white"
        >
          <div className="aurora-strip absolute inset-x-0 top-0 h-1" />
          <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-teal/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-amber/15 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08] ring-1 ring-white/15 shadow-lg backdrop-blur">
              <Anchor className="h-5 w-5 text-teal-light" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Nexport ERP</p>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/45">
                Enterprise Suite
              </p>
            </div>
          </div>

          <div className="relative space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold leading-tight tracking-tight"
            >
              Import operations,{" "}
              <span className="text-gradient-teal">unified</span>.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
              className="max-w-md text-sm leading-relaxed text-white/60"
            >
              Track shipments, containers, and documents from port of loading to
              final delivery — all in one enterprise-grade platform.
            </motion.p>

            <ul className="space-y-3">
              {brandFeatures.map((f, i) => (
                <motion.li
                  key={f.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.36 + i * 0.06, duration: 0.4 }}
                  className="flex items-center gap-3 text-sm text-white/80"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] ring-1 ring-white/10">
                    <f.icon className="h-4 w-4 text-teal-light" />
                  </div>
                  {f.label}
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="relative text-[11px] text-white/35">
            © {new Date().getFullYear()} Nexport ERP — Enterprise Import Management
          </p>
        </motion.aside>

        {/* Form panel */}
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center justify-center p-4 sm:p-8"
        >
          <div className="w-full max-w-md">
            {/* Compact mobile brand */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal/20 to-teal/5 ring-1 ring-teal/25 shadow-sm">
                <Anchor className="h-5 w-5 text-teal" strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">Nexport ERP</p>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Enterprise Suite
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/70 dark:border-white/[0.08] dark:bg-slate-950/60 p-6 sm:p-8 shadow-enterprise-xl backdrop-blur-2xl">
              {badge && (
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-teal/25 bg-teal/10 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-teal">
                  <Sparkles className="h-3 w-3" />
                  {badge}
                </div>
              )}
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
              <div className="mt-6">{children}</div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

/* ─── Login page ───────────────────────────────────────────────── */

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useERPStore((state) => state.setAuth);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otpForm, setOtpForm] = useState({ code: "" });
  const [otpChallenge, setOtpChallenge] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((json) => setNeedsBootstrap(Boolean(json.data?.needsBootstrap)))
      .catch(() => setError("Unable to reach the server"));
  }, []);

  useEffect(() => {
    const email = params.get("email") || "";
    if (email) setForm((current) => ({ ...current, email }));
  }, [params]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        needsBootstrap ? "/api/auth/bootstrap" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      if (json.data?.otpRequired) {
        setOtpChallenge(json.data);
        setOtpForm({ code: "" });
        return;
      }
      setAuth(json.data.user, json.data.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
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
      if (!res.ok) throw new Error(json.error || "OTP verification failed");
      setAuth(json.data.user, json.data.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const passwordCreated = params.get("passwordCreated") === "1";

  const passwordForm = (
    <form onSubmit={submit} className="space-y-4">
      {passwordCreated && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 p-3 text-sm text-success"
        >
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Password created. Sign in with your password and email OTP to continue.</span>
        </motion.div>
      )}
      {needsBootstrap && (
        <FieldGroup index={0}>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="mt-1.5"
            placeholder="Jane Doe"
          />
        </FieldGroup>
      )}
      <FieldGroup index={needsBootstrap ? 1 : 0}>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="mt-1.5"
          placeholder="you@company.com"
        />
      </FieldGroup>
      <FieldGroup index={needsBootstrap ? 2 : 1}>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="mt-1.5"
          placeholder="••••••••"
        />
      </FieldGroup>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
      <Button
        type="submit"
        variant="teal"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        <LogIn className="mr-2 h-4 w-4" />
        {loading ? "Please wait..." : needsBootstrap ? "Create Admin Account" : "Sign In"}
      </Button>
    </form>
  );

  const otpLoginForm = (
    <form onSubmit={verifyOtp} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-teal/25 bg-teal/8 p-3.5 text-sm"
      >
        <div className="flex items-center gap-2 font-medium text-teal">
          <CheckCircle2 className="h-4 w-4" />
          Password verified
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter the 6-digit OTP sent to{" "}
          <span className="font-medium text-foreground">
            {otpChallenge?.maskedEmail || "your email"}
          </span>
          .
        </p>
      </motion.div>
      <FieldGroup index={0}>
        <Label htmlFor="otp">Email OTP</Label>
        <Input
          id="otp"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={otpForm.code}
          onChange={(e) =>
            setOtpForm({ code: e.target.value.replace(/\D/g, "").slice(0, 6) })
          }
          required
          className="mt-1.5 text-center text-lg font-mono tracking-[0.4em]"
          autoFocus
          placeholder="000000"
        />
      </FieldGroup>
      {error && (
        <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="teal"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        <LogIn className="mr-2 h-4 w-4" />
        {loading ? "Please wait..." : "Verify OTP & Sign In"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          setOtpChallenge(null);
          setOtpForm({ code: "" });
          setError("");
        }}
      >
        Back to password
      </Button>
    </form>
  );

  return (
    <AuthShell
      badge={needsBootstrap ? "First-time setup" : otpChallenge ? "Step 2 of 2" : "Step 1 of 2"}
      title={
        needsBootstrap
          ? "Create Admin Account"
          : otpChallenge
          ? "Verify email OTP"
          : "Welcome back"
      }
      description={
        needsBootstrap
          ? "Set up the first administrator account to start using Nexport ERP."
          : otpChallenge
          ? "Enter the one-time code sent to your email inbox to complete sign-in."
          : "Sign in with your password to continue to the ERP dashboard."
      }
    >
      {otpChallenge ? otpLoginForm : passwordForm}
    </AuthShell>
  );
}

/* ─── Setup password page ──────────────────────────────────────── */

export function SetupPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const logout = useERPStore((state) => state.logout);
  const token = params.get("token") || "";
  const [invitation, setInvitation] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/auth/invitation?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setInvitation(json.data);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) return setError("Passwords do not match");
    const res = await fetch("/api/auth/setup-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json();
    if (!res.ok) return setError(json.error || "Unable to create password");
    logout();
    const email = encodeURIComponent(json.data?.user?.email || invitation?.email || "");
    router.replace(`/login?passwordCreated=1&email=${email}`);
  };

  return (
    <AuthShell
      badge="Invitation"
      title="Create your password"
      description={
        invitation
          ? `Welcome, ${invitation.name}. Set a strong password to activate your account (${invitation.email}).`
          : "Validating your invitation link..."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FieldGroup index={0}>
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!invitation}
            className="mt-1.5"
            placeholder="At least 8 characters"
          />
        </FieldGroup>
        <FieldGroup index={1}>
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={!invitation}
            className="mt-1.5"
            placeholder="Re-enter your password"
          />
        </FieldGroup>
        {error && (
          <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="teal"
          size="lg"
          className="w-full"
          disabled={!invitation}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Create Password
        </Button>
      </form>
    </AuthShell>
  );
}

function FieldGroup({ index = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.32 }}
    >
      {children}
    </motion.div>
  );
}
