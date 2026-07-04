"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  User,
  KeyRound,
  LogOut,
  ChevronDown,
  Menu,
  Loader2,
  Save,
} from "lucide-react";
import { useERPStore } from "@/lib/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThemeSelector } from "@/components/layout/theme-selector";
import { toast } from "@/hooks/use-toast";

const moduleLabels = {
  dashboard: "Dashboard",
  shipments: "Shipments",
  containers: "Containers",
  companies: "Companies",
  documents: "Documents",
  notifications: "Notifications",
  reports: "Reports",
  admin: "Admin",
};

const moduleSections = {
  dashboard: "Overview",
  shipments: "Operations",
  containers: "Operations",
  companies: "Operations",
  documents: "Operations",
  notifications: "System",
  reports: "System",
  admin: "System",
};

export function ERPHeader() {
  const {
    activeModule,
    setSearchOpen,
    toggleSidebar,
    user,
    logout,
    canView,
    token,
    setCurrentUser,
    refreshNotificationUnreadCount,
  } = useERPStore();
  const unreadCount = useERPStore((s) => s.notificationUnreadCount);
  const [mounted, setMounted] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordOtpSent, setPasswordOtpSent] = React.useState(false);
  const [passwordOtpEmail, setPasswordOtpEmail] = React.useState("");
  const [profileForm, setProfileForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    avatar: "",
  });
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otpCode: "",
  });

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useEffect(() => {
    if (!token || !canView("notifications")) return;
    void refreshNotificationUnreadCount();
    const interval = window.setInterval(() => {
      void refreshNotificationUnreadCount();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [token, canView, refreshNotificationUnreadCount]);

  React.useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      department: user.department || "",
      avatar: user.avatar || "",
    });
  }, [user, profileOpen]);

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Failed to save profile");
      if (json.data) setCurrentUser(json.data);
      setProfileOpen(false);
      toast({ title: "Profile saved", description: "Your account details were updated." });
    } catch (error) {
      toast({
        title: "Profile not saved",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const validatePasswordForm = () => {
    const passwordChecks = [
      [passwordForm.newPassword.length >= 10, "New password must be at least 10 characters."],
      [/[A-Z]/.test(passwordForm.newPassword), "New password must contain an uppercase letter."],
      [/[a-z]/.test(passwordForm.newPassword), "New password must contain a lowercase letter."],
      [/[0-9]/.test(passwordForm.newPassword), "New password must contain a number."],
      [/[^A-Za-z0-9]/.test(passwordForm.newPassword), "New password must contain a special character."],
    ];
    const failedCheck = passwordChecks.find(([valid]) => !valid);
    if (failedCheck) {
      toast({
        title: "Password is not strong enough",
        description: failedCheck[1],
        variant: "destructive",
      });
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Confirm password must match the new password.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const requestPasswordOtp = async () => {
    if (!validatePasswordForm()) return;
    setPasswordSaving(true);
    try {
      const response = await fetch("/api/auth/password/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Failed to send OTP");
      setPasswordOtpSent(true);
      setPasswordOtpEmail(json.data?.maskedEmail || user?.email || "");
      toast({
        title: "OTP sent",
        description: `Enter the 6 digit code sent to ${json.data?.maskedEmail || "your email"}.`,
      });
    } catch (error) {
      toast({
        title: "OTP not sent",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (!passwordOtpSent) {
      await requestPasswordOtp();
      return;
    }
    if (!validatePasswordForm()) return;
    if (!/^\d{6}$/.test(passwordForm.otpCode.trim())) {
      toast({
        title: "OTP required",
        description: "Enter the 6 digit OTP from your email.",
        variant: "destructive",
      });
      return;
    }
    setPasswordSaving(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          otpCode: passwordForm.otpCode,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Failed to change password");
      setPasswordOpen(false);
      setPasswordOtpSent(false);
      setPasswordOtpEmail("");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "", otpCode: "" });
      toast({ title: "Password changed", description: "Use the new password next time you sign in." });
    } catch (error) {
      toast({
        title: "Password not changed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = (user?.name || "User")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-card/84 px-4 shadow-sm backdrop-blur-xl lg:px-6",
        "dark:border-white/[0.07] dark:bg-card/70"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0 rounded-xl"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Nexport ERP
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {moduleSections[activeModule]}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">
              {moduleLabels[activeModule]}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <span className="sm:hidden text-sm font-semibold">
        {moduleLabels[activeModule]}
      </span>

      <div className="flex-1" />

      {/* Search trigger */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setSearchOpen(true)}
        className={cn(
          "hidden md:flex h-10 w-72 items-center gap-2.5 rounded-lg border border-border/70 bg-background/70 px-3.5 text-muted-foreground shadow-sm backdrop-blur transition-colors",
          "hover:border-teal/40 hover:bg-card hover:text-foreground",
          "dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
        )}
      >
        <Search className="h-4 w-4 text-teal" />
        <span className="text-sm">Search anything...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded-md border border-border/70 bg-muted/70 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </motion.button>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden rounded-xl"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>

      <Separator orientation="vertical" className="h-6 hidden lg:block bg-border/60" />

      {canView("notifications") && (
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-xl text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/[0.06]"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white/70 dark:ring-slate-950/70"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>
      )}

      <ThemeSelector />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-10 items-center gap-2 rounded-xl px-2 hover:bg-white/60 dark:hover:bg-white/[0.06]"
          >
            <Avatar className="h-8 w-8 ring-1 ring-teal/25">
              <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
              <AvatarFallback className="bg-teal/15 text-teal text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:inline text-sm font-semibold">
              {user?.name || "User"}
            </span>
            <ChevronDown className="hidden lg:inline h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl border-white/40 bg-popover/95 shadow-enterprise-lg backdrop-blur-xl dark:border-white/[0.08]"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>

    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            Update the account details shown across the ERP.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={saveProfile}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profileForm.name}
                onChange={(event) => updateProfileField("name", event.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(event) => updateProfileField("email", event.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <Input
                id="profile-phone"
                value={profileForm.phone}
                onChange={(event) => updateProfileField("phone", event.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-department">Department</Label>
              <Input
                id="profile-department"
                value={profileForm.department}
                onChange={(event) => updateProfileField("department", event.target.value)}
                placeholder="Operations"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-role">Role</Label>
              <Input id="profile-role" value={user?.role || ""} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={profileSaving}>
              {profileSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog
      open={passwordOpen}
      onOpenChange={(open) => {
        setPasswordOpen(open);
        if (!open) {
          setPasswordOtpSent(false);
          setPasswordOtpEmail("");
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "", otpCode: "" });
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Verify with an email OTP before changing your password.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={savePassword}>
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => updatePasswordField("currentPassword", event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => updatePasswordField("newPassword", event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {passwordOtpSent && (
            <div className="grid gap-2 rounded-xl border border-teal/20 bg-teal/5 p-3">
              <Label htmlFor="password-otp">Email OTP</Label>
              <Input
                id="password-otp"
                inputMode="numeric"
                maxLength={6}
                value={passwordForm.otpCode}
                onChange={(event) => updatePasswordField("otpCode", event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 digit code"
                required
              />
              <p className="text-xs text-muted-foreground">
                Code sent to {passwordOtpEmail || "your email"}. It expires in 5 minutes.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            {passwordOtpSent && (
              <Button type="button" variant="ghost" onClick={requestPasswordOtp} disabled={passwordSaving}>
                Resend OTP
              </Button>
            )}
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              {passwordOtpSent ? "Change Password" : "Send OTP"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
