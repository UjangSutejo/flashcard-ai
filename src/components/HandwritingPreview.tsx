"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  PenLine,
  Download,
  FileDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  Settings2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HandwritingOptions } from "@/app/page";
import { renderHandwriting, exportToPDF, exportAllPNG } from "@/lib/handwriting";

interface HandwritingPreviewProps {
  text: string;
  options: HandwritingOptions;
  onOptionsChange: (opts: HandwritingOptions) => void;
  onBack: () => void;
  onReset: () => void;
}

const INK_COLORS = [
  { id: "black" as const, label: "Hitam", hex: "#1a1a1a" },
  { id: "blue" as const, label: "Biru", hex: "#1a3a6b" },
  { id: "red" as const, label: "Merah", hex: "#8b0000" },
];

const FONT_SIZES = [
  { id: "small" as const, label: "Kecil" },
  { id: "medium" as const, label: "Sedang" },
  { id: "large" as const, label: "Besar" },
];

const FONT_STYLES = [
  { id: "caveat" as const, label: "Caveat" },
  { id: "indie" as const, label: "Indie Flower" },
  { id: "reenie" as const, label: "Reenie Beanie" },
];

export function HandwritingPreview({
  text,
  options,
  onOptionsChange,
  onBack,
  onReset,
}: HandwritingPreviewProps) {
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const renderTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doRender = useCallback(async (opts: HandwritingOptions) => {
    setIsRendering(true);
    try {
      const result = await renderHandwriting(text, opts);
      setPages(result.pages);
      setCurrentPage(0);
    } catch (err) {
      console.error("Render error:", err);
      toast.error("Gagal merender handwriting", {
        description: "Coba refresh halaman atau ganti opsi.",
      });
    } finally {
      setIsRendering(false);
    }
  }, [text]);

  // Initial render
  useEffect(() => {
    doRender(options);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render on option change (debounced)
  const handleOptionChange = useCallback(
    (newOpts: HandwritingOptions) => {
      onOptionsChange(newOpts);
      clearTimeout(renderTimeoutRef.current);
      renderTimeoutRef.current = setTimeout(() => {
        doRender(newOpts);
      }, 500);
    },
    [onOptionsChange, doRender]
  );

  // Draw current page to preview div
  useEffect(() => {
    if (!previewRef.current || pages.length === 0) return;
    const container = previewRef.current;
    
    // Clear and append canvas
    container.innerHTML = "";
    const canvas = pages[currentPage];
    if (canvas) {
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.display = "block";
      canvas.style.borderRadius = "12px";
      container.appendChild(canvas);
    }
  }, [pages, currentPage]);

  const handleExportPDF = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    try {
      await exportToPDF(pages);
      toast.success("PDF berhasil didownload! 🎉", {
        description: `${pages.length} halaman · jawaban-ai-handwritten.pdf`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal export PDF. Coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    try {
      await exportAllPNG(pages);
      toast.success(
        pages.length > 1
          ? `${pages.length} PNG berhasil didownload!`
          : "PNG berhasil didownload! 🎉"
      );
    } catch (err) {
      console.error(err);
      toast.error("Gagal export PNG. Coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-4">
      {/* Controls card */}
      <div className="bg-card rounded-2xl border border-border paper-shadow overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <PenLine className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-semibold text-sm text-foreground">
                Tulisan Tangan
              </h2>
              {pages.length > 0 && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {pages.length} halaman
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => doRender(options)}
                disabled={isRendering}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent transition-all disabled:opacity-50"
                title="Render ulang"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRendering && "animate-spin")} />
                Render Ulang
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all",
                  showSettings
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Pengaturan
              </button>
            </div>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="p-4 bg-muted/30 border-b border-border/50 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Ink color */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Warna Tinta
                </label>
                <div className="flex gap-2">
                  {INK_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() =>
                        handleOptionChange({ ...options, inkColor: color.id })
                      }
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                        options.inkColor === color.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Ukuran Tulisan
                </label>
                <div className="flex gap-2">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() =>
                        handleOptionChange({ ...options, fontSize: size.id })
                      }
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                        options.fontSize === size.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font style */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Gaya Tulisan
                </label>
                <div className="flex gap-2 flex-wrap">
                  {FONT_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        handleOptionChange({ ...options, fontStyle: style.id })
                      }
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                        options.fontStyle === style.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ruled lines toggle */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground">
                Garis Bergaris (Ruled Paper)
              </span>
              <button
                onClick={() =>
                  handleOptionChange({
                    ...options,
                    showRuledLines: !options.showRuledLines,
                  })
                }
                className={cn(
                  "relative inline-flex w-9 h-5 items-center rounded-full transition-colors",
                  options.showRuledLines
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
              >
                <span
                  className={cn(
                    "inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                    options.showRuledLines ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* Canvas preview */}
        <div className="p-5">
          {isRendering ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Membuat tulisan tangan...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ini mungkin membutuhkan beberapa detik
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Canvas display */}
              <div
                ref={previewRef}
                className="rounded-xl overflow-hidden border border-border shadow-inner bg-yellow-50 dark:bg-slate-900"
                style={{ minHeight: "400px" }}
              />

              {/* Page navigation */}
              {pages.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(0, p - 1))
                    }
                    disabled={currentPage === 0}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 hover:bg-accent transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-muted-foreground font-medium">
                    Halaman {currentPage + 1} / {pages.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(pages.length - 1, p + 1))
                    }
                    disabled={currentPage === pages.length - 1}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 hover:bg-accent transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Download section */}
        <div className="px-5 pb-5 pt-1 space-y-3">
          <div className="h-px bg-border" />

          <div className="flex flex-col sm:flex-row gap-2">
            {/* PDF download - primary */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting || isRendering || pages.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              Download PDF
              {pages.length > 1 && (
                <span className="text-blue-200 text-xs font-normal">
                  ({pages.length} hal)
                </span>
              )}
            </button>

            {/* PNG download - secondary */}
            <button
              onClick={handleExportPNG}
              disabled={isExporting || isRendering || pages.length === 0}
              className="flex items-center justify-center gap-2 border border-border hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed text-foreground text-sm py-3 px-5 rounded-xl transition-all"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PNG
            </button>
          </div>

          {/* Back/Reset buttons */}
          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-accent py-2 px-4 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Edit Teks
            </button>
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-accent py-2 px-4 rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Mulai Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
