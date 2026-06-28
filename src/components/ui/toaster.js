"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
export function Toaster() {
    const { toasts } = useToast();
    return (_jsxs(ToastProvider, { children: [toasts.map(function (_a) {
                var { id, title, description, action } = _a, props = __rest(_a, ["id", "title", "description", "action"]);
                const destructive = props.variant === "destructive";
                const Icon = destructive ? AlertTriangle : CheckCircle2;
                return (_jsxs(Toast, Object.assign({}, props, { children: [_jsxs("div", { className: "flex w-full flex-col px-2.5 py-2.5", children: [_jsxs("div", { className: "flex items-center gap-2.5 pr-7", children: [_jsx("div", { className: cn("flex h-9 w-9 shrink-0 items-center justify-center", destructive ? "text-red-500" : "text-teal"), children: _jsx(Icon, { className: "h-9 w-9" }) }), _jsx("div", { className: "min-w-0", children: title && _jsx(ToastTitle, { children: title }) })] }), description && (_jsx(ToastDescription, { className: "ml-[46px] -mt-1 mb-2 break-words", children: description })), action && _jsx("div", { className: "ml-[46px] flex items-center gap-3.5", children: action })] }), _jsx(ToastClose, {})] }), id));
            }), _jsx(ToastViewport, {})] }));
}
