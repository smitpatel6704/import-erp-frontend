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
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(ToastPrimitives.Viewport, Object.assign({ ref: ref, className: cn("fixed right-0 top-4 z-[99999] flex max-h-screen w-full flex-col gap-3 px-3 sm:right-4 sm:w-[420px] sm:px-0", className) }, props)));
});
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva("group pointer-events-auto relative flex min-h-0 w-full overflow-hidden rounded-xl border p-0 pr-8 shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full", {
    variants: {
        variant: {
            default: "border-gray-300 bg-white text-gray-950 dark:border-white/[0.08] dark:bg-gray-800 dark:text-gray-50 dark:shadow-[0_2px_12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06)]",
            destructive: "destructive group border-gray-300 bg-white text-gray-950 dark:border-white/[0.08] dark:bg-gray-800 dark:text-gray-50 dark:shadow-[0_2px_12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06)]",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
const Toast = React.forwardRef((_a, ref) => {
    var { className, variant } = _a, props = __rest(_a, ["className", "variant"]);
    return (_jsx(ToastPrimitives.Root, Object.assign({ ref: ref, className: cn(toastVariants({ variant }), className) }, props)));
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(ToastPrimitives.Action, Object.assign({ ref: ref, className: cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className) }, props)));
});
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(ToastPrimitives.Close, Object.assign({ ref: ref, className: cn("absolute right-3 top-2.5 rounded-md p-1 text-gray-700 opacity-40 transition-opacity hover:opacity-80 focus:opacity-80 focus:outline-none focus:ring-1 focus:ring-ring dark:text-gray-400", className), "toast-close": "" }, props, { children: _jsx(X, { className: "h-3.5 w-3.5" }) })));
});
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(ToastPrimitives.Title, Object.assign({ ref: ref, className: cn("pb-0.5 text-sm font-semibold leading-tight text-gray-950 dark:text-gray-50", className) }, props)));
});
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(ToastPrimitives.Description, Object.assign({ ref: ref, className: cn("text-[13px] font-medium leading-tight text-gray-500 dark:text-gray-400", className) }, props)));
});
ToastDescription.displayName = ToastPrimitives.Description.displayName;
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, };
