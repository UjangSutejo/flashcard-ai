"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { UploadZone } from "@/components/UploadZone";
import { FlashcardPreview } from "@/components/FlashcardPreview";
import { StepIndicator } from "@/components/StepIndicator";
import { InfiniteGrid } from "@/components/infinite-grid-background";
import { generateFlashcards } from "@/lib/actions";
import { BookOpen, Sparkles, PenLine } from "lucide-react";

export type Step = "upload" | "solving" | "flashcards";

type DifficultyLevel = "easy" | "medium" | "hard" | "mixed";
type QuestionSource = "kurikulum_indonesia" | "internasional";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [solution, setSolution] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [solveProgress, setSolveProgress] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState<number>(6);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("mixed");
  const [questionSource, setQuestionSource] = useState<QuestionSource>("kurikulum_indonesia");

  const handleFileAccepted = useCallback((file: File, preview: string) => {
    setUploadedFile(file);
    setPreviewUrl(preview);
    setSolution("");
    setStep("upload");
  }, []);

  const handleSolve = useCallback(async () => {
    if (!uploadedFile) return;

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
      formData.append("count", String(flashcardCount));
      formData.append("difficulty", difficulty);
      formData.append("source", questionSource);

      const result = await generateFlashcards(formData);

      clearInterval(progressInterval);
      setSolveProgress(100);

      if (result.error) {
        toast.error("Gagal membuat flashcard", {
          description: result.error,
        });
        setStep("upload");
        return;
      }

      setSolution(result.solution || "");

      setTimeout(() => {
        setStep("flashcards");
        setIsLoading(false);
        toast.success("Flashcard berhasil dibuat! 🎉", {
          description: "Periksa flashcard di bawah untuk belajar.",
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

  const handleReset = useCallback(() => {
    setStep("upload");
    setUploadedFile(null);
    setPreviewUrl(null);
    setSolution("");
    setSolveProgress(0);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen">
      <InfiniteGrid />

      <Navbar />

      <main className="relative container mx-auto px-4 pt-6 pb-16 max-w-6xl">
        {/* Hero section */}
        {step === "upload" && !uploadedFile && (
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Gemini 2.5 Pro
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
              Buat Flashcard{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                Otomatis
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Upload materi belajar → AI buat flashcard otomatis → Belajar jadi lebih mudah dan efektif
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {[
                { icon: BookOpen, text: "Semua Mata Pelajaran" },
                { icon: PenLine, text: "Flashcard Efektif" },
                { icon: Sparkles, text: "AI Gemini 2.5 Pro" },
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
          {/* Flashcard options */}
          <div className="bg-card rounded-2xl border border-border paper-shadow overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <PenLine className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm text-foreground">
                      Pengaturan Flashcard
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Atur jumlah flashcard, tingkat kesulitan, dan sumber soal sebelum AI membuat soal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Jumlah flashcard */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Jumlah Flashcard
                </label>
                <div className="flex flex-wrap gap-2">
                  {[3, 5, 8, 10, 15].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setFlashcardCount(count)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        flashcardCount === count
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {count} kartu
                    </button>
                  ))}
                </div>
              </div>

              {/* Tingkat kesulitan */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Tingkat Kesulitan
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "easy" as DifficultyLevel, label: "Easy" },
                    { id: "medium" as DifficultyLevel, label: "Medium" },
                    { id: "hard" as DifficultyLevel, label: "Hard" },
                    { id: "mixed" as DifficultyLevel, label: "Campur" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setDifficulty(lvl.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        difficulty === lvl.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sumber soal */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Sumber Soal
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      id: "kurikulum_indonesia" as QuestionSource,
                      label: "Kurikulum Merdeka / Indonesia",
                    },
                    { id: "internasional" as QuestionSource, label: "Internasional" },
                  ].map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => setQuestionSource(src.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        questionSource === src.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upload zone */}
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

          {/* Flashcard preview */}
          {step === "flashcards" && solution && (
            <FlashcardPreview content={solution} />
          )}
        </div>
      </main>
    </div>
  );
}
