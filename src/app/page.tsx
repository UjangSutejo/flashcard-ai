"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { UploadZone } from "@/components/UploadZone";
import { SolutionViewer } from "@/components/SolutionViewer";
import { HandwritingPreview } from "@/components/HandwritingPreview";
import { StepIndicator } from "@/components/StepIndicator";
import { solveHomework } from "@/lib/actions";
import { BookOpen, Sparkles, PenLine } from "lucide-react";

export type Step = "upload" | "solving" | "solution" | "handwriting";

export interface HandwritingOptions {
  inkColor: "black" | "blue" | "red";
  fontSize: "small" | "medium" | "large";
  showRuledLines: boolean;
  fontStyle: "caveat" | "indie" | "reenie";
}

const DEFAULT_OPTIONS: HandwritingOptions = {
  inkColor: "blue",
  fontSize: "medium",
  showRuledLines: true,
  fontStyle: "caveat",
};

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [solution, setSolution] = useState<string>("");
  const [editedSolution, setEditedSolution] = useState<string>("");
  const [hwOptions, setHwOptions] = useState<HandwritingOptions>(DEFAULT_OPTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [solveProgress, setSolveProgress] = useState(0);

  const handleFileAccepted = useCallback((file: File, preview: string) => {
    setUploadedFile(file);
    setPreviewUrl(preview);
    setSolution("");
    setEditedSolution("");
    setStep("upload");
  }, []);

  const handleSolve = useCallback(async () => {
    if (!uploadedFile) return;

    // File size check
    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar! Maksimal 5MB.", {
        description: "Coba kompres gambar atau ambil foto yang lebih jelas.",
      });
      return;
    }

    setStep("solving");
    setIsLoading(true);
    setSolveProgress(0);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setSolveProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + Math.random() * 12;
      });
    }, 600);

    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);

      const result = await solveHomework(formData);

      clearInterval(progressInterval);
      setSolveProgress(100);

      if (result.error) {
        toast.error("Gagal menganalisis soal", {
          description: result.error,
        });
        setStep("upload");
        return;
      }

      setSolution(result.solution || "");
      setEditedSolution(result.solution || "");

      setTimeout(() => {
        setStep("solution");
        setIsLoading(false);
        toast.success("Soal berhasil diselesaikan! 🎉", {
          description: "Periksa jawaban di bawah, lalu convert ke tulisan tangan.",
        });
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      if (msg.includes("timeout") || msg.includes("AbortError")) {
        toast.error("Waktu habis!", {
          description: "AI membutuhkan waktu terlalu lama. Coba lagi.",
        });
      } else {
        toast.error("Gagal menghubungi AI", {
          description: "Periksa koneksi internet atau coba upload ulang.",
        });
      }
      setStep("upload");
      setIsLoading(false);
    }
  }, [uploadedFile]);

  const handleConvertHandwriting = useCallback(() => {
    if (!editedSolution.trim()) {
      toast.error("Tidak ada teks untuk dikonversi!");
      return;
    }
    setStep("handwriting");
    toast.success("Mengubah ke tulisan tangan...", { duration: 2000 });
  }, [editedSolution]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setUploadedFile(null);
    setPreviewUrl(null);
    setSolution("");
    setEditedSolution("");
    setSolveProgress(0);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
      {/* Background grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234b83d0' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Navbar />

      <main className="relative container mx-auto px-4 pt-6 pb-16 max-w-6xl">
        {/* Hero section */}
        {step === "upload" && !uploadedFile && (
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by GPT-4o Vision
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
              Selesaikan PR{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                Otomatis
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Upload foto soal PR → AI analisis & selesaikan step-by-step → Download sebagai{" "}
              <span className="font-semibold text-foreground">tulisan tangan realistis</span>
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {[
                { icon: BookOpen, text: "Semua Mata Pelajaran" },
                { icon: PenLine, text: "Tulisan Tangan Realistis" },
                { icon: Sparkles, text: "AI GPT-4o Vision" },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 border border-border px-3 py-1.5 rounded-full text-muted-foreground shadow-sm"
                >
                  <Icon className="w-3 h-3" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step indicator */}
        {(uploadedFile || step !== "upload") && (
          <StepIndicator currentStep={step} className="mb-6 animate-fade-in" />
        )}

        {/* Main content */}
        <div className="space-y-6">
          {/* Upload zone - always visible unless in handwriting step */}
          {step !== "handwriting" && (
            <UploadZone
              onFileAccepted={handleFileAccepted}
              uploadedFile={uploadedFile}
              previewUrl={previewUrl}
              onSolve={handleSolve}
              onReset={handleReset}
              isLoading={isLoading}
              progress={solveProgress}
              step={step}
            />
          )}

          {/* Solution viewer */}
          {(step === "solution" || step === "handwriting") && (
            <SolutionViewer
              solution={solution}
              editedSolution={editedSolution}
              onEditChange={setEditedSolution}
              onConvertHandwriting={handleConvertHandwriting}
              isHandwritingStep={step === "handwriting"}
            />
          )}

          {/* Handwriting preview */}
          {step === "handwriting" && (
            <HandwritingPreview
              text={editedSolution}
              options={hwOptions}
              onOptionsChange={setHwOptions}
              onBack={() => setStep("solution")}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}
