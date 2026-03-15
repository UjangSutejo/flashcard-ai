"use client";

import { cn } from "@/lib/utils";
import { Upload, Brain, FileText } from "lucide-react";
import type { Step } from "@/app/page";

interface StepIndicatorProps {
  currentStep: Step;
  className?: string;
}

const STEPS = [
  { id: "upload" as Step, label: "Upload", icon: Upload },
  { id: "solving" as Step, label: "Analisis AI", icon: Brain },
  { id: "flashcards" as Step, label: "Flashcard", icon: FileText },
];

const STEP_ORDER: Step[] = ["upload", "solving", "flashcards"];

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted &&
                      "bg-primary border-primary text-primary-foreground",
                    isCurrent &&
                      "bg-primary/10 border-primary text-primary shadow-sm shadow-primary/20",
                    isUpcoming && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 4.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium hidden sm:block transition-colors",
                    isCurrent && "text-primary",
                    isCompleted && "text-primary/70",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-20 h-0.5 mx-1 transition-all duration-500",
                    index < currentIndex ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
