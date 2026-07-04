"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ImagePlus, Palette, Save, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useERPStore } from "@/lib/store";
import {
  applyBrandLogo,
  applyThemeColor,
  getSavedBrandLogos,
  getSavedCustomThemeColor,
  getSavedThemeColor,
  loadBrandLogosFromDatabase,
  saveBrandLogoToDatabase,
} from "@/components/erp/theme-runtime";

const palettes = [
  { id: "teal", label: "Ocean", color: "#0d9488" },
  { id: "blue", label: "Harbor", color: "#2563eb" },
  { id: "emerald", label: "Trade", color: "#059669" },
  { id: "violet", label: "Royal", color: "#7c3aed" },
  { id: "rose", label: "Coral", color: "#e11d48" },
  { id: "amber", label: "Cargo", color: "#f59e0b" },
];

const logoCanvasWidth = 1024;
const logoCanvasHeight = 256;
const collapsedLogoCanvasSize = 512;
const defaultLogoScale = 100;
const supportedLogoTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
}

function getLogoCanvasSize(mode) {
  return mode === "collapsed"
    ? { width: collapsedLogoCanvasSize, height: collapsedLogoCanvasSize }
    : { width: logoCanvasWidth, height: logoCanvasHeight };
}

function createSizedLogoImage(dataUrl, scalePercent = defaultLogoScale, mode = "light") {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error("This image could not be loaded. Please use PNG, JPG, WEBP, GIF, or SVG."));
        return;
      }
      const canvasSize = getLogoCanvasSize(mode);
      const canvasScale = Math.min(8, Math.max(0.25, scalePercent / 100));
      const fitScale = Math.min(
        canvasSize.width / image.naturalWidth,
        canvasSize.height / image.naturalHeight
      ) * canvasScale;
      const width = Math.max(1, Math.round(image.naturalWidth * fitScale));
      const height = Math.max(1, Math.round(image.naturalHeight * fitScale));
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(dataUrl);
        return;
      }
      try {
        context.clearRect(0, 0, canvasSize.width, canvasSize.height);
        context.drawImage(
          image,
          Math.round((canvasSize.width - width) / 2),
          Math.round((canvasSize.height - height) / 2),
          width,
          height
        );
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(dataUrl);
      }
    };
    image.onerror = () => reject(new Error("This image format is not supported by the browser. Please use PNG, JPG, WEBP, GIF, or SVG."));
    image.src = dataUrl;
  });
}

export function ThemeCustomizer() {
  const [selected, setSelected] = useState(() => getSavedThemeColor());
  const [savedTheme, setSavedTheme] = useState(() => getSavedThemeColor());
  const [customColor, setCustomColor] = useState(() => getSavedCustomThemeColor());
  const [savedCustomColor, setSavedCustomColor] = useState(() => getSavedCustomThemeColor());
  const [logos, setLogos] = useState(() => getSavedBrandLogos());
  const [logoError, setLogoError] = useState("");
  const [pendingLogo, setPendingLogo] = useState(null);
  const [logoScale, setLogoScale] = useState(defaultLogoScale);
  const [logoSaving, setLogoSaving] = useState(false);
  const { sidebarOpen, toggleSidebar } = useERPStore();

  const selectPalette = (id) => {
    setSelected(id);
  };

  const selectCustomColor = (color) => {
    setCustomColor(color);
    setSelected("custom");
  };

  const themeHasChanges = selected !== savedTheme || (selected === "custom" && customColor !== savedCustomColor);

  const saveAppearance = () => {
    applyThemeColor(selected, customColor);
    setSavedTheme(selected);
    setSavedCustomColor(customColor);
  };

  const resetTheme = () => {
    setSelected("teal");
    setCustomColor("#8b5cf6");
    applyThemeColor("teal", "#8b5cf6");
    setSavedTheme("teal");
    setSavedCustomColor("#8b5cf6");
  };


  useEffect(() => {
    let cancelled = false;
    void loadBrandLogosFromDatabase()
      .then((loadedLogos) => {
        if (!cancelled) setLogos(loadedLogos);
      })
      .catch((error) => {
        console.error("Brand logos could not be loaded:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateLogo = async (mode, logoDataUrl) => {
    try {
      applyBrandLogo(mode, logoDataUrl);
      await saveBrandLogoToDatabase(mode, logoDataUrl);
      const nextLogos = { ...logos, [mode]: logoDataUrl || "" };
      setLogos(nextLogos);
      setLogoError("");
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : "Logo could not be saved.");
    }
  };

  const handleLogoUpload = async (mode, file) => {
    if (!file) return;
    setLogoError("");
    if (!supportedLogoTypes.includes(file.type)) {
      setLogoError("Unsupported logo format. Please upload PNG, JPG, WEBP, GIF, or SVG.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      await createSizedLogoImage(dataUrl, defaultLogoScale, mode);
      setPendingLogo({ mode, dataUrl, fileName: file.name });
      setLogoScale(defaultLogoScale);
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : "Logo could not be loaded.");
    }
  };

  const confirmLogoUpload = async () => {
    if (!pendingLogo) return;
    setLogoSaving(true);
    try {
      const adjustedLogo = await createSizedLogoImage(pendingLogo.dataUrl, logoScale, pendingLogo.mode);
      await updateLogo(pendingLogo.mode, adjustedLogo);
      setPendingLogo(null);
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : "Logo could not be saved.");
    } finally {
      setLogoSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/12 text-teal ring-1 ring-teal/25">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription className="text-xs">
                Choose the ERP theme color used across navigation, buttons, charts, and highlights.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {palettes.map((palette, index) => {
              const active = selected === palette.id;
              return (
                <motion.button
                  key={palette.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.03, duration: 0.24 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectPalette(palette.id)}
                  className={cn(
                    "group flex h-20 flex-col items-start justify-between rounded-lg border bg-background/65 p-3 text-left shadow-sm transition-all",
                    "hover:border-teal/40 hover:bg-card",
                    active ? "border-teal/45 ring-2 ring-teal/20" : "border-border/70"
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span
                      className="h-6 w-6 rounded-full shadow-sm ring-1 ring-black/10"
                      style={{ backgroundColor: palette.color }}
                    />
                    {active && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-semibold">{palette.label}</span>
                </motion.button>
              );
            })}
            <motion.label
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + palettes.length * 0.03, duration: 0.24 }}
              whileHover={{ y: -2 }}
              onClick={() => selectCustomColor(customColor)}
              className={cn(
                "group flex h-20 cursor-pointer flex-col items-start justify-between rounded-lg border bg-background/65 p-3 text-left shadow-sm transition-all",
                "hover:border-teal/40 hover:bg-card",
                selected === "custom" ? "border-teal/45 ring-2 ring-teal/20" : "border-border/70"
              )}
            >
              <span className="flex w-full items-center justify-between">
                <span
                  className="h-6 w-6 rounded-full shadow-sm ring-1 ring-black/10"
                  style={{ backgroundColor: customColor }}
                />
                {selected === "custom" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </span>
              <span className="flex w-full items-center justify-between gap-2">
                <span className="text-xs font-semibold">Custom</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={(event) => selectCustomColor(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  className="h-6 w-8 cursor-pointer rounded border border-border/60 bg-transparent p-0"
                  aria-label="Choose custom theme color"
                />
              </span>
            </motion.label>
          </div>



          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/65 p-3 shadow-sm transition-all">
            <div>
              <p className="text-sm font-semibold">Sidebar Expanded</p>
              <p className="text-xs text-muted-foreground">Keep the sidebar fully expanded or collapsed</p>
            </div>
            <Switch checked={sidebarOpen} onCheckedChange={toggleSidebar} />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {[
              { id: "light", label: "Sidebar Logo", description: "Used when the sidebar is expanded" },
              { id: "collapsed", label: "Collapsed Sidebar Logo", description: "Used in the compact icon rail" },
            ].map((item) => {
              const logo = logos[item.id];
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/65 p-3 shadow-sm"
                >
                  <div
                    className={cn(
                      "flex h-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/35",
                      item.id === "collapsed" ? "w-14" : "w-24"
                    )}
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={`${item.label} preview`}
                        className={cn("h-full w-full object-contain", item.id === "collapsed" ? "p-1" : "p-1.5")}
                        onError={() => updateLogo(item.id, "")}
                      />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) => {
                            handleLogoUpload(item.id, event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      {logo && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5"
                          onClick={() => updateLogo(item.id, "")}
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {logoError && (
              <p className="lg:col-span-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {logoError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/35 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-teal" />
              <p className="text-xs text-muted-foreground">
                Choose a color, then save to apply it across navigation, buttons, cards, and highlights.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={resetTheme}>
                Reset
              </Button>
              <Button type="button" size="sm" onClick={saveAppearance} disabled={!themeHasChanges}>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!pendingLogo} onOpenChange={(open) => !open && !logoSaving && setPendingLogo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Logo Zoom</DialogTitle>
            <DialogDescription>
              Zoom the uploaded logo until it fills the sidebar preview correctly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-xl border border-border/70 bg-muted/25 p-5">
              <div
                className={cn(
                  "mx-auto flex w-full items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm",
                  pendingLogo?.mode === "collapsed" ? "aspect-square max-w-48" : "aspect-[4/1] max-w-sm"
                )}
              >
                {pendingLogo && (
                  <img
                    src={pendingLogo.dataUrl}
                    alt="Logo preview"
                    className="h-full w-full object-contain transition-transform duration-150"
                    style={{ transform: `scale(${logoScale / 100})` }}
                  />
                )}
              </div>
              {pendingLogo?.fileName && (
                <p className="mt-3 truncate text-center text-xs text-muted-foreground">
                  {pendingLogo.fileName}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Manual Zoom</p>
                <span className="text-xs font-medium text-muted-foreground">{logoScale}%</span>
              </div>
              <Slider
                value={[logoScale]}
                min={50}
                max={800}
                step={1}
                onValueChange={(value) => setLogoScale(value[0] || defaultLogoScale)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingLogo(null)}
              disabled={logoSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmLogoUpload} disabled={logoSaving}>
              {logoSaving ? "Saving..." : "Save Logo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
