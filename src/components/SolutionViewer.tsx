"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { FileText, Edit3, Eye, PenLine, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SolutionViewerProps {
  solution: string;
  editedSolution: string;
  onEditChange: (val: string) => void;
  onConvertHandwriting: () => void;
  isHandwritingStep: boolean;
}

export function SolutionViewer({
  solution,
  editedSolution,
  onEditChange,
  onConvertHandwriting,
  isHandwritingStep,
}: SolutionViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedSolution);
    setCopied(true);
    toast.success("Teks disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = editedSolution.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="animate-slide-up">
      <div className="bg-card rounded-2xl border border-border paper-shadow overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-semibold text-sm text-foreground">
                Jawaban AI
              </h2>
              <span className="text-xs text-muted-foreground">
                ~{wordCount} kata · Est. {estimatedPages} halaman
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-accent transition-all"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Disalin!" : "Salin"}
              </button>

              {/* View/Edit toggle */}
              {!isHandwritingStep && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all",
                    isEditing
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {isEditing ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {isEditing ? (
            /* Edit mode */
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Edit teks jawaban jika diperlukan. Rumus LaTeX ($...$) tetap didukung.
              </p>
              <textarea
                value={editedSolution}
                onChange={(e) => onEditChange(e.target.value)}
                className="w-full min-h-[400px] p-4 rounded-xl border border-border bg-background text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder="Teks jawaban..."
                spellCheck={false}
              />
              {editedSolution !== solution && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditChange(solution)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Reset ke jawaban original
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Preview mode */
            <div className="prose-solution text-sm text-foreground leading-relaxed max-h-[500px] overflow-y-auto pr-2">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mt-4 mb-2 text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold mt-4 mb-2 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold mt-3 mb-1 text-primary">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-blue-700 dark:text-blue-400">{children}</strong>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1.5 ml-2 mb-3">{children}</ol>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 ml-2 mb-3">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-3">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {editedSolution}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer action */}
        {!isHandwritingStep && (
          <div className="px-5 pb-5">
            <button
              onClick={onConvertHandwriting}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg glow-blue"
            >
              <PenLine className="w-4 h-4" />
              Convert ke Tulisan Tangan
              <span className="text-blue-200 text-xs font-normal">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
