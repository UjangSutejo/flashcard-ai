"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { FileText, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FlashcardPreviewProps {
  content: string;
}

type OptionKey = "A" | "B" | "C" | "D";

interface ParsedFlashcard {
  raw: string;
  question: string;
  options: Record<OptionKey, string | null>;
  correct?: OptionKey;
  explanation?: string;
}

function parseFlashcards(content: string): ParsedFlashcard[] {
  const parts = content
    .split(/^---\s*$/m)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return [];
  }

  return parts.map((raw) => {
    const lines = raw.split("\n").map((l) => l.trim());
    let question = "";
    const options: Record<OptionKey, string | null> = {
      A: null,
      B: null,
      C: null,
      D: null,
    };
    let correct: OptionKey | undefined;
    let explanationLines: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith("pertanyaan:")) {
        question = line.slice("pertanyaan:".length).trim();
      } else if (/^opsi\s*a:/i.test(line)) {
        options.A = line.replace(/^opsi\s*a:/i, "").trim();
      } else if (/^opsi\s*b:/i.test(line)) {
        options.B = line.replace(/^opsi\s*b:/i, "").trim();
      } else if (/^opsi\s*c:/i.test(line)) {
        options.C = line.replace(/^opsi\s*c:/i, "").trim();
      } else if (/^opsi\s*d:/i.test(line)) {
        options.D = line.replace(/^opsi\s*d:/i, "").trim();
      } else if (/^jawaban benar:/i.test(line)) {
        const val = line.replace(/^jawaban benar:/i, "").trim().toUpperCase();
        if (val === "A" || val === "B" || val === "C" || val === "D") {
          correct = val;
        }
      } else if (line.toLowerCase().startsWith("pembahasan:")) {
        explanationLines.push(line.slice("pembahasan:".length).trim());
      } else if (explanationLines.length > 0) {
        // baris lanjutan pembahasan
        explanationLines.push(line);
      }
    }

    return {
      raw,
      question: question || raw,
      options,
      correct,
      explanation: explanationLines.join("\n").trim() || undefined,
    };
  });
}

export function FlashcardPreview({ content }: FlashcardPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const flashcards = useMemo(() => parseFlashcards(content), [content]);

  const current = flashcards[currentIndex];

  const handleCopy = async () => {
    if (!current) return;
    await navigator.clipboard.writeText(current.raw);
    setCopiedIndex(currentIndex);
    toast.success("Flashcard disalin ke clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelect = (key: OptionKey) => {
    if (!current) return;
    setSelectedOption(key);
  };

  const resetStateForCard = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setSelectedOption(null);
  };

  if (!content.trim() || flashcards.length === 0) return null;

  const isCorrect = selectedOption && current?.correct && selectedOption === current.correct;
  const hasAnswered = selectedOption !== null;

  return (
    <div className="animate-slide-up">
      <div className="bg-card rounded-2xl border border-border paper-shadow overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">
                Latihan Pilihan Ganda
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Soal {currentIndex + 1} dari {flashcards.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                resetStateForCard(Math.max(0, currentIndex - 1))
              }
              disabled={currentIndex === 0}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                resetStateForCard(Math.min(flashcards.length - 1, currentIndex + 1))
              }
              disabled={currentIndex === flashcards.length - 1}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card content */}
        <div className="p-5 space-y-4">
          {/* Question */}
          <div className="rounded-xl border border-border/80 bg-background/70 dark:bg-slate-900/60 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Pertanyaan
            </p>
            <div className="prose-solution text-sm text-foreground leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {current?.question || ""}
              </ReactMarkdown>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Pilih jawaban yang menurutmu benar
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(["A", "B", "C", "D"] as OptionKey[]).map((key) => {
                const label = current?.options[key];
                if (!label) return null;

                const isSelected = selectedOption === key;
                const isOptionCorrect = current?.correct === key;

                const baseClass =
                  "w-full flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-all";

                const stateClass = !hasAnswered
                  ? "border-border bg-card hover:bg-accent/70 cursor-pointer"
                  : isOptionCorrect
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                    : isSelected
                      ? "border-red-500 bg-red-500/10 text-red-900 dark:text-red-100"
                      : "border-border bg-card text-muted-foreground";

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(key)}
                    className={cn(baseClass, stateClass)}
                  >
                    <span className="mt-0.5 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center border border-border bg-background">
                      {key}
                    </span>
                    <span className="flex-1 text-left">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & explanation */}
          {hasAnswered && current?.correct && (
            <div
              className={cn(
                "mt-1 rounded-xl border px-3.5 py-3 text-xs leading-relaxed",
                isCorrect
                  ? "border-emerald-500/60 bg-emerald-500/5 text-emerald-900 dark:text-emerald-100"
                  : "border-red-500/60 bg-red-500/5 text-red-900 dark:text-red-100"
              )}
            >
              <p className="font-semibold mb-1.5">
                {isCorrect ? "Jawabanmu benar 👏" : "Jawabanmu belum tepat"}
              </p>
              {!isCorrect && (
                <p className="mb-1.5">
                  Jawaban yang benar adalah{" "}
                  <span className="font-semibold">opsi {current.correct}</span>.
                </p>
              )}
              {current.explanation && (
                <div className="prose-solution text-xs">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {current.explanation}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/60 mt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copiedIndex === currentIndex ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedIndex === currentIndex ? "Flashcard disalin" : "Salin flashcard ini"}
            </button>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              <span>Latihan mandiri, tidak menyimpan jawabanmu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

