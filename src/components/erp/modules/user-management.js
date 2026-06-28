"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import {
  KeyRound,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useERPStore } from "@/lib/store";
import { readJsonResponse } from "@/lib/utils";

const modules = [
  ["dashboard", "Dashboard"],
  ["shipments", "Shipments"],
  ["containers", "Containers"],
  ["companies", "Companies"],
  ["documents", "Documents"],
  ["notifications", "Notifications"],
  ["reports", "Reports"],
];
const actionPermissions = [
  ["create", "Create/Add"],
  ["update", "Edit/Save"],
  ["delete", "Delete"],
  ["upload", "Upload"],
  ["import", "Import"],
  ["export", "Export/Download"],
  ["verify", "Verify/Reject"],
];
const fullActions = () =>
  Object.fromEntries(actionPermissions.map(([action]) => [action, true]));
const rolePresets = {
  admin: [],
  manager: modules.map(([module]) => ({
    module,
    access: ["dashboard", "notifications", "reports"].includes(module)
      ? "view"
      : "edit",
    actions: ["dashboard", "notifications", "reports"].includes(module)
      ? undefined
      : fullActions(),
  })),
  employee: [
    { module: "dashboard", access: "view" },
    { module: "shipments", access: "edit", actions: fullActions() },
    { module: "containers", access: "view" },
    { module: "companies", access: "view" },
    { module: "documents", access: "edit", actions: fullActions() },
    { module: "notifications", access: "view" },
  ],
  viewer: modules.map(([module]) => ({ module, access: "view" })),
};
const emptyForm = {
  name: "",
  email: "",
  role: "employee",
  department: "",
  phone: "",
  permissions: rolePresets.employee,
};

const accessFor = (permissions, module) =>
  permissions.find((item) => item.module === module)?.access || "none";
const setAccess = (permissions, module, access) => {
  const remaining = permissions.filter((item) => item.module !== module);
  return access === "none"
    ? remaining
    : [...remaining, { module, access, ...(access === "edit" ? { actions: fullActions() } : {}) }];
};
const permissionForModule = (permissions, module) =>
  permissions.find((item) => item.module === module) || null;
const actionFor = (permissions, module, action) => {
  const permission = permissionForModule(permissions, module);
  if (!permission || permission.access !== "edit") return false;
  if (!permission.actions) return true;
  return permission.actions[action] !== false;
};
const setAction = (permissions, module, action, checked) =>
  permissions.map((item) => {
    if (item.module !== module) return item;
    return {
      ...item,
      actions: {
        ...fullActions(),
        ...(item.actions || {}),
        [action]: checked,
      },
    };
  });

export default function UserManagement() {
  const currentUser = useERPStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchUsers = useCallback(async () => {
    const res = await fetch(
      `/api/settings/users?search=${encodeURIComponent(search)}`,
    );
    const json = await readJsonResponse(res);
    if (res.ok) setUsers(json.data || []);
  }, [search]);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  const changeRole = (role) =>
    setForm(
      Object.assign(Object.assign({}, form), {
        role,
        permissions: rolePresets[role] || [],
      }),
    );
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
    setOpen(true);
  };
  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      phone: user.phone || "",
      permissions: user.permissions || [],
    });
    setMessage("");
    setOpen(true);
  };
  const save = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        editing ? `/api/settings/users/${editing.id}` : "/api/settings/users",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const json = await readJsonResponse(res);
      if (!res.ok) throw new Error(json.error || "Unable to save user");
      if (editing) {
        setMessage("User permissions updated.");
        await fetchUsers();
        setOpen(false);
      } else {
        const delivery = json.data;
        await fetchUsers();
        setForm(emptyForm);
        setOpen(false);
        if (delivery.emailSent) {
          toast({
            title: "Invitation sent",
            description: `Email sent to ${form.email}.`,
          });
        } else {
          setMessage(
            `User created. Email was not sent. Password link: ${delivery.inviteUrl}`,
          );
          toast({
            title: "User created",
            description: "Email was not sent. Use the password link shown below.",
          });
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  const resend = async (user) => {
    setMessage("");
    try {
      const res = await fetch(
        `/api/settings/users/${user.id}/resend-invitation`,
        { method: "POST" },
      );
      const json = await readJsonResponse(res);
      if (!res.ok) throw new Error(json.error || "Unable to resend invitation");
      setMessage(
        json.data.emailSent
          ? "Invitation email sent."
          : `Email was not sent. Password link: ${json.data.inviteUrl}`,
      );
    } catch (error) {
      setMessage(error.message);
    }
  };
  const deleteUser = async (user) => {
    if (
      !window.confirm(
        `Permanently delete ${user.name} (${user.email})? This cannot be undone.`,
      )
    )
      return;
    setMessage("");
    try {
      const res = await fetch(`/api/settings/users/${user.id}`, {
        method: "DELETE",
      });
      const json = await readJsonResponse(res);
      if (!res.ok) throw new Error(json.error || "Unable to delete user");
      setMessage("User deleted permanently.");
      await fetchUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };
  return _jsxs("div", {
    className: "space-y-4",
    children: [
      _jsxs(Card, {
        className: "shadow-sm",
        children: [
          _jsx(CardHeader, {
            children: _jsxs("div", {
              className: "flex flex-col gap-3 sm:flex-row sm:items-center",
              children: [
                _jsx(CardTitle, {
                  className: "text-base",
                  children: "User & Role Management",
                }),
                _jsx(Input, {
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                  placeholder: "Search users...",
                  className: "sm:ml-auto sm:w-56 h-9",
                }),
                _jsxs(Button, {
                  onClick: openCreate,
                  size: "sm",
                  children: [
                    _jsx(Plus, { className: "mr-1 h-4 w-4" }),
                    "Add User",
                  ],
                }),
              ],
            }),
          }),
          _jsx(CardContent, {
            className: "p-0",
            children: _jsxs(Table, {
              children: [
                _jsx(TableHeader, {
                  children: _jsxs(TableRow, {
                    children: [
                      _jsx(TableHead, { children: "User" }),
                      _jsx(TableHead, { children: "Role" }),
                      _jsx(TableHead, { children: "Department" }),
                      _jsx(TableHead, { children: "Account" }),
                      _jsx(TableHead, {
                        className: "text-right",
                        children: "Actions",
                      }),
                    ],
                  }),
                }),
                _jsx(TableBody, {
                  children: users.length
                    ? users.map((user) =>
                        _jsxs(
                          TableRow,
                          {
                            children: [
                              _jsxs(TableCell, {
                                children: [
                                  _jsx("p", {
                                    className: "font-medium",
                                    children: user.name,
                                  }),
                                  _jsx("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: user.email,
                                  }),
                                ],
                              }),
                              _jsx(TableCell, {
                                children: _jsx(Badge, {
                                  variant: "outline",
                                  className: "capitalize",
                                  children: user.role,
                                }),
                              }),
                              _jsx(TableCell, {
                                children: user.department || "—",
                              }),
                              _jsx(TableCell, {
                                children: _jsx(Badge, {
                                  variant: user.isActive
                                    ? "secondary"
                                    : "destructive",
                                  children: !user.isActive
                                    ? "Inactive"
                                    : user.passwordSetAt
                                      ? "Active"
                                      : "Invitation pending",
                                }),
                              }),
                              _jsx(TableCell, {
                                className: "text-right",
                                children: _jsxs("div", {
                                  className: "inline-flex gap-1",
                                  children: [
                                    _jsx(Button, {
                                      variant: "ghost",
                                      size: "icon",
                                      onClick: () => openEdit(user),
                                      title: "Edit role and permissions",
                                      children: _jsx(UserCog, {
                                        className: "h-4 w-4",
                                      }),
                                    }),
                                    !user.passwordSetAt &&
                                      _jsx(Button, {
                                        variant: "ghost",
                                        size: "icon",
                                        onClick: () => resend(user),
                                        title: "Resend invitation",
                                        children: _jsx(RefreshCw, {
                                          className: "h-4 w-4",
                                        }),
                                      }),
                                    user.id !== currentUser?.id &&
                                      _jsx(Button, {
                                        variant: "ghost",
                                        size: "icon",
                                        onClick: () => deleteUser(user),
                                        title: "Delete user permanently",
                                        children: _jsx(Trash2, {
                                          className: "h-4 w-4 text-destructive",
                                        }),
                                      }),
                                  ],
                                }),
                              }),
                            ],
                          },
                          user.id,
                        ),
                      )
                    : _jsx(TableRow, {
                        children: _jsx(TableCell, {
                          colSpan: 5,
                          className: "py-10 text-center text-muted-foreground",
                          children: "No users found",
                        }),
                      }),
                }),
              ],
            }),
          }),
        ],
      }),
      message &&
        _jsx("div", {
          className: "rounded-md border bg-muted/30 p-3 text-xs break-all",
          children: message,
        }),
      _jsx(Dialog, {
        open,
        onOpenChange: setOpen,
        children: _jsxs(DialogContent, {
          className: "max-w-2xl max-h-[85vh] overflow-y-auto",
          children: [
            _jsxs(DialogHeader, {
              children: [
                _jsx(DialogTitle, {
                  children: editing ? "Edit User Access" : "Invite New User",
                }),
                _jsx(DialogDescription, {
                  children: editing
                    ? "Change the role and module access for this employee."
                    : "The employee will receive an email link to create a password.",
                }),
              ],
            }),
            _jsxs("div", {
              className: "grid grid-cols-2 gap-4",
              children: [
                _jsxs("div", {
                  children: [
                    _jsx(Label, { children: "Full Name" }),
                    _jsx(Input, {
                      value: form.name,
                      onChange: (e) =>
                        setForm(
                          Object.assign(Object.assign({}, form), {
                            name: e.target.value,
                          }),
                        ),
                      className: "mt-1",
                    }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx(Label, { children: "Email" }),
                    _jsx(Input, {
                      type: "email",
                      value: form.email,
                      onChange: (e) =>
                        setForm(
                          Object.assign(Object.assign({}, form), {
                            email: e.target.value,
                          }),
                        ),
                      disabled: Boolean(editing),
                      className: "mt-1",
                    }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx(Label, { children: "Role" }),
                    _jsxs(Select, {
                      value: form.role,
                      onValueChange: changeRole,
                      children: [
                        _jsx(SelectTrigger, {
                          className: "mt-1",
                          children: _jsx(SelectValue, {}),
                        }),
                        _jsxs(SelectContent, {
                          children: [
                            _jsx(SelectItem, {
                              value: "admin",
                              children: "Admin",
                            }),
                            _jsx(SelectItem, {
                              value: "manager",
                              children: "Manager",
                            }),
                            _jsx(SelectItem, {
                              value: "employee",
                              children: "Employee",
                            }),
                            _jsx(SelectItem, {
                              value: "viewer",
                              children: "Viewer",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx(Label, { children: "Department" }),
                    _jsx(Input, {
                      value: form.department,
                      onChange: (e) =>
                        setForm(
                          Object.assign(Object.assign({}, form), {
                            department: e.target.value,
                          }),
                        ),
                      className: "mt-1",
                    }),
                  ],
                }),
              ],
            }),
            form.role !== "admin" &&
              _jsxs("div", {
                className: "space-y-2",
                children: [
                  _jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      _jsx(Shield, { className: "h-4 w-4 text-teal" }),
                      _jsx("p", {
                        className: "text-sm font-semibold",
                        children: "Module Permissions",
                      }),
                    ],
                  }),
                  _jsx("div", {
                    className: "grid grid-cols-1 gap-2",
                    children: modules.map(([module, label]) =>
                      _jsxs(
                        "div",
                        {
                          className:
                            "rounded-md border p-3",
                          children: [
                            _jsxs("div", {
                              className:
                                "flex items-center justify-between gap-3",
                              children: [
                                _jsx("span", {
                                  className: "text-sm font-medium",
                                  children: label,
                                }),
                                _jsxs(Select, {
                                  value: accessFor(form.permissions, module),
                                  onValueChange: (access) =>
                                    setForm(
                                      Object.assign(Object.assign({}, form), {
                                        permissions: setAccess(
                                          form.permissions,
                                          module,
                                          access,
                                        ),
                                      }),
                                    ),
                                  children: [
                                    _jsx(SelectTrigger, {
                                      className: "h-8 w-32 text-xs",
                                      children: _jsx(SelectValue, {}),
                                    }),
                                    _jsxs(SelectContent, {
                                      children: [
                                        _jsx(SelectItem, {
                                          value: "none",
                                          children: "No Access",
                                        }),
                                        _jsx(SelectItem, {
                                          value: "view",
                                          children: "View",
                                        }),
                                        _jsx(SelectItem, {
                                          value: "edit",
                                          children: "View & Edit",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            accessFor(form.permissions, module) === "edit" &&
                              _jsx("div", {
                                className:
                                  "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3",
                                children: actionPermissions.map(
                                  ([action, label]) =>
                                    _jsxs(
                                      "label",
                                      {
                                        className:
                                          "flex items-center gap-2 rounded-md border bg-muted/20 px-2 py-1.5 text-xs",
                                        children: [
                                          _jsx("input", {
                                            type: "checkbox",
                                            checked: actionFor(
                                              form.permissions,
                                              module,
                                              action,
                                            ),
                                            onChange: (event) =>
                                              setForm({
                                                ...form,
                                                permissions: setAction(
                                                  form.permissions,
                                                  module,
                                                  action,
                                                  event.target.checked,
                                                ),
                                              }),
                                          }),
                                          _jsx("span", { children: label }),
                                        ],
                                      },
                                      action,
                                    ),
                                ),
                              }),
                          ],
                        },
                        module,
                      ),
                    ),
                  }),
                ],
              }),
            _jsxs(DialogFooter, {
              children: [
                _jsx(Button, {
                  variant: "outline",
                  onClick: () => setOpen(false),
                  children: "Cancel",
                }),
                _jsxs(Button, {
                  onClick: save,
                  disabled: loading || !form.name || !form.email,
                  children: [
                    _jsx(KeyRound, { className: "mr-2 h-4 w-4" }),
                    loading
                      ? "Saving..."
                      : editing
                        ? "Save Access"
                        : "Create & Send Invite",
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
