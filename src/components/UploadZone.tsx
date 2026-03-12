"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, Image, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Step } from "@/app/page";

interface UploadZoneProps {
  onFileAccepted: (file: File, preview: string) => void;
  uploadedFile: File | null;
  previewUrl: string | null;
  onSolve: () => void;
  onReset: () => void;
  isLoading: boolean;
  progress: number;
  step: Step;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function UploadZone({
  onFileAccepted,
  uploadedFile,
  previewUrl,
  onSolve,
  onReset,
  isLoading,
  progress,
  step,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: { file: File; errors: { code: string; message: string }[] }[]) => {
      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        if (err.code === "file-too-large") {
          toast.error("File terlalu besar!", {
            description: "Maksimal 5MB. Kompres gambar atau ambil foto yang lebih kecil.",
          });
        } else if (err.code === "file-invalid-type") {
          toast.error("Format tidak didukung!", {
            description: "Gunakan JPG, PNG, atau WEBP.",
          });
        } else {
          toast.error("File ditolak", { description: err.message });
        }
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error("File terlalu besar!", {
          description: `Ukuran: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maksimal 5MB.`,
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      onFileAccepted(file, preview);
      toast.success("Gambar berhasil diupload!", {
        description: `${file.name} (${(file.size / 1024).toFixed(0)}KB)`,
      });
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isLoading,
  });

  const isSolving = step === "solving";

  return (
    <div className="animate-slide-up">
      <div className="bg-card rounded-2xl border border-border paper-shadow overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Image className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-semibold text-sm text-foreground">
              Upload Soal PR
            </h2>
          </div>
        </div>

        <div className="p-5">
          {!uploadedFile ? (
            /* Drop zone */
            <div
              {...getRootProps()}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200",
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.01] dropzone-active"
                  : "border-border hover:border-primary/60 hover:bg-accent/50"
              )}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                    isDragActive
                      ? "bg-primary text-primary-foreground scale-110"
                      : "bg-accent text-muted-foreground"
                  )}
                >
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-1">
                    {isDragActive ? "Lepaskan di sini!" : "Upload foto soal PR"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop atau{" "}
                    <span className="text-primary font-medium underline underline-offset-2">
                      klik untuk pilih file
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {["JPG", "PNG", "WEBP", "HEIC"].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                    >
                      {fmt}
                    </span>
                  ))}
                  <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    Maks. 5MB
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* File preview */
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 group">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Soal yang diupload"
                    className="w-full max-h-64 object-contain"
                  />
                )}
                
                {/* Overlay on hover */}
                {!isLoading && (
                  <button
                    onClick={onReset}
                    className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <div className="bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg">
                      <X className="w-4 h-4 text-foreground" />
                    </div>
                  </button>
                )}

                {/* File info badge */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                  {uploadedFile.name} · {(uploadedFile.size / 1024).toFixed(0)}KB
                </div>
              </div>

              {/* Progress bar (when solving) */}
              {isSolving && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      <span>AI sedang menganalisis soal...</span>
                    </div>
                    <span className="font-mono text-primary">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 shimmer" />
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground text-center">
                    {progress < 30
                      ? "Memuat gambar ke AI..."
                      : progress < 60
                      ? "Mengidentifikasi mata pelajaran..."
                      : progress < 85
                      ? "Menyusun solusi step-by-step..."
                      : "Memfinalisasi jawaban..."}
                  </div>
                </div>
              )}

              {/* Tips */}
              {!isSolving && step !== "solution" && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Pastikan gambar jelas dan teks terbaca. Foto dengan pencahayaan baik memberikan hasil terbaik.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {!isSolving && (
                <div className="flex gap-2">
                  {step !== "solution" && (
                    <button
                      onClick={onSolve}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-medium text-sm py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md glow-blue"
                    >
                      <Sparkles className="w-4 h-4" />
                      Selesaikan dengan AI
                    </button>
                  )}
                  <button
                    onClick={onReset}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 border border-border hover:bg-accent disabled:opacity-60 text-muted-foreground hover:text-foreground text-sm py-2.5 px-4 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                    {step === "solution" ? "Ganti Foto" : "Hapus"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
