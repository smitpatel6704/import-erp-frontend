"use client";

import { useEffect } from "react";

const STORAGE_KEY = "nexport_theme_color";
const CUSTOM_COLOR_KEY = "nexport_custom_theme_color";
const SIDEBAR_STYLE_KEY = "nexport_sidebar_style";
const LOGO_LIGHT_KEY = "nexport_logo_light";
const LOGO_DARK_KEY = "nexport_logo_dark";
const LOGO_COLLAPSED_KEY = "nexport_logo_collapsed";
const DEFAULT_COLOR = "teal";
const DEFAULT_CUSTOM_COLOR = "#8b5cf6";
const DEFAULT_SIDEBAR_STYLE = "dark";
const CUSTOM_COLOR = "custom";
const THEME_COLORS = {
  teal: "#0d9488",
  blue: "#2563eb",
  emerald: "#059669",
  violet: "#7c3aed",
  rose: "#e11d48",
  amber: "#f59e0b",
};

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("nexport_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeHexColor(color) {
  if (typeof color !== "string") return DEFAULT_CUSTOM_COLOR;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`;
  }
  return DEFAULT_CUSTOM_COLOR;
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex).slice(1);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function getReadableTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "oklch(0.16 0.02 260)" : "oklch(0.99 0 0)";
}

function applyCustomVariables(hex) {
  const customColor = normalizeHexColor(hex);
  const rootStyle = document.documentElement.style;
  const readableText = getReadableTextColor(customColor);
  const variables = {
    "--primary": customColor,
    "--ring": customColor,
    "--chart-1": customColor,
    "--teal": customColor,
    "--teal-light": `color-mix(in oklch, ${customColor} 72%, white)`,
    "--teal-dark": `color-mix(in oklch, ${customColor} 78%, black)`,
    "--primary-foreground": readableText,
  };

  Object.entries(variables).forEach(([name, value]) => {
    rootStyle.setProperty(name, value);
  });
}

function clearCustomVariables() {
  [
    "--primary",
    "--ring",
    "--chart-1",
    "--teal",
    "--teal-light",
    "--teal-dark",
    "--primary-foreground",
  ].forEach((name) => document.documentElement.style.removeProperty(name));
}

function applyThemeVariables(hex) {
  const themeColor = normalizeHexColor(hex);
  const rootStyle = document.documentElement.style;
  const readableText = getReadableTextColor(themeColor);
  const variables = {
    "--primary": themeColor,
    "--ring": themeColor,
    "--chart-1": themeColor,
    "--teal": themeColor,
    "--teal-light": `color-mix(in oklch, ${themeColor} 72%, white)`,
    "--teal-dark": `color-mix(in oklch, ${themeColor} 78%, black)`,
    "--accent": `color-mix(in oklch, ${themeColor} 16%, white)`,
    "--accent-foreground": `color-mix(in oklch, ${themeColor} 78%, black)`,
    "--primary-foreground": readableText,
  };

  Object.entries(variables).forEach(([name, value]) => {
    rootStyle.setProperty(name, value);
  });
}

export function applyThemeColor(color = DEFAULT_COLOR, customColor) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.themeColor = color;
  window.localStorage.setItem(STORAGE_KEY, color);
  if (color === CUSTOM_COLOR) {
    const normalized = normalizeHexColor(customColor || getSavedCustomThemeColor());
    window.localStorage.setItem(CUSTOM_COLOR_KEY, normalized);
    applyThemeVariables(normalized);
  } else {
    const paletteColor = THEME_COLORS[color] || THEME_COLORS[DEFAULT_COLOR];
    applyThemeVariables(paletteColor);
  }
}

export function getSavedThemeColor() {
  if (typeof window === "undefined") return DEFAULT_COLOR;
  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR;
}

export function getSavedCustomThemeColor() {
  if (typeof window === "undefined") return DEFAULT_CUSTOM_COLOR;
  return normalizeHexColor(window.localStorage.getItem(CUSTOM_COLOR_KEY) || DEFAULT_CUSTOM_COLOR);
}

export function applySidebarStyle(style = DEFAULT_SIDEBAR_STYLE) {
  if (typeof document === "undefined") return;
  const nextStyle = style === "rail" ? "rail" : DEFAULT_SIDEBAR_STYLE;
  document.documentElement.dataset.sidebarStyle = nextStyle;
  window.localStorage.setItem(SIDEBAR_STYLE_KEY, nextStyle);
  window.dispatchEvent(new CustomEvent("nexport-sidebar-style-change", { detail: nextStyle }));
}

export function getSavedSidebarStyle() {
  if (typeof window === "undefined") return DEFAULT_SIDEBAR_STYLE;
  return window.localStorage.getItem(SIDEBAR_STYLE_KEY) === "rail" ? "rail" : DEFAULT_SIDEBAR_STYLE;
}

export function applyBrandLogo(mode, logoDataUrl) {
  if (typeof window === "undefined") return;
  const key = mode === "collapsed" ? LOGO_COLLAPSED_KEY : mode === "dark" ? LOGO_DARK_KEY : LOGO_LIGHT_KEY;
  try {
    if (logoDataUrl) {
      window.localStorage.setItem(key, logoDataUrl);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    throw new Error("Logo is too large to save. Please upload a smaller image.");
  }
  window.dispatchEvent(
    new CustomEvent("nexport-brand-logo-change", {
      detail: getSavedBrandLogos(),
    })
  );
}

export async function loadBrandLogosFromDatabase() {
  if (typeof window === "undefined") return getSavedBrandLogos();
  const headers = authHeaders();
  if (!headers.Authorization) return getSavedBrandLogos();
  const response = await window.fetch("/api/settings/brand-logos", {
    headers,
    cache: "no-store",
  });
  if (!response.ok) return getSavedBrandLogos();
  const json = await response.json();
  const logos = {
    light: json.data?.light || "",
    dark: json.data?.dark || "",
    collapsed: json.data?.collapsed || "",
  };
  applyBrandLogo("light", logos.light);
  applyBrandLogo("dark", logos.dark);
  applyBrandLogo("collapsed", logos.collapsed);
  return logos;
}

export async function saveBrandLogoToDatabase(mode, logoDataUrl) {
  applyBrandLogo(mode, logoDataUrl);
  const headers = authHeaders();
  if (!headers.Authorization) return getSavedBrandLogos();
  const response = await window.fetch("/api/settings/brand-logos", {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode, logoDataUrl: logoDataUrl || "" }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.error || "Logo could not be saved to the database.");
  }
  return getSavedBrandLogos();
}

export function getSavedBrandLogos() {
  if (typeof window === "undefined") return { light: "", dark: "", collapsed: "" };
  return {
    light: window.localStorage.getItem(LOGO_LIGHT_KEY) || "",
    dark: window.localStorage.getItem(LOGO_DARK_KEY) || "",
    collapsed: window.localStorage.getItem(LOGO_COLLAPSED_KEY) || "",
  };
}

export function ThemeRuntime() {
  useEffect(() => {
    const savedTheme = getSavedThemeColor();
    applyThemeColor(savedTheme, getSavedCustomThemeColor());
    applySidebarStyle(getSavedSidebarStyle());
    void loadBrandLogosFromDatabase().catch((error) => {
      console.error("Brand logos could not be loaded from database:", error);
    });
  }, []);

  return null;
}
