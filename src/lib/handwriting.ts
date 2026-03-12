import type { HandwritingOptions } from "@/app/page";

export interface HandwritingPage {
  canvas: HTMLCanvasElement;
  pageNumber: number;
}

// Font mapping
const FONT_MAP = {
  caveat: "'Caveat', cursive",
  indie: "'Indie Flower', cursive",
  reenie: "'Reenie Beanie', cursive",
};

const FONT_SIZE_MAP = {
  small: 20,
  medium: 26,
  large: 32,
};

const INK_COLOR_MAP = {
  black: "#1a1a1a",
  blue: "#1a3a6b",
  red: "#8b0000",
};

const LINE_HEIGHT_MULTIPLIER = 1.5;
const PAGE_WIDTH = 794; // A4 at 96dpi
const PAGE_HEIGHT = 1123; // A4 at 96dpi
const MARGIN_LEFT = 80;
const MARGIN_RIGHT = 60;
const MARGIN_TOP = 80;
const MARGIN_BOTTOM = 60;
const RULED_LINE_GAP = 32;

export interface RenderResult {
  pages: HTMLCanvasElement[];
  totalPages: number;
}

/**
 * Strip markdown/LaTeX for handwriting rendering
 */
function processTextForHandwriting(text: string): string {
  return text
    // Remove LaTeX display math $$...$$
    .replace(/\$\$([^$]+)\$\$/g, (_, math) => `[${math.trim()}]`)
    // Remove LaTeX inline math $...$
    .replace(/\$([^$]+)\$/g, (_, math) => math.trim())
    // Remove markdown bold **text**
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    // Remove markdown italic *text*
    .replace(/\*([^*]+)\*/g, "$1")
    // Remove \boxed{...}
    .replace(/\\boxed\{([^}]+)\}/g, "[ Jawaban: $1 ]")
    // Remove other latex commands
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    // Normalize multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Add slight randomness to simulate real handwriting
 */
function perturbValue(value: number, amount: number): number {
  return value + (Math.random() - 0.5) * amount;
}

/**
 * Render text as handwriting on canvas pages
 */
export async function renderHandwriting(
  text: string,
  options: HandwritingOptions
): Promise<RenderResult> {
  // Load fonts first
  await loadHandwritingFonts();

  const fontSize = FONT_SIZE_MAP[options.fontSize];
  const lineHeight = Math.round(fontSize * LINE_HEIGHT_MULTIPLIER);
  const inkColor = INK_COLOR_MAP[options.inkColor];
  const fontFamily = FONT_MAP[options.fontStyle];

  const processedText = processTextForHandwriting(text);
  const lines = wrapTextToLines(processedText, fontSize, fontFamily);

  const usableWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const usableHeight = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
  const linesPerPage = Math.floor(usableHeight / RULED_LINE_GAP);

  const pages: HTMLCanvasElement[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const canvas = document.createElement("canvas");
    canvas.width = PAGE_WIDTH;
    canvas.height = PAGE_HEIGHT;
    const ctx = canvas.getContext("2d")!;

    // Background
    drawPaperBackground(ctx, canvas.width, canvas.height, options.showRuledLines);

    // Left margin line
    ctx.strokeStyle = "#ef9fa5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT - 10, 0);
    ctx.lineTo(MARGIN_LEFT - 10, canvas.height);
    ctx.stroke();

    // Draw lines of text
    let pageLineCount = 0;

    while (lineIndex < lines.length && pageLineCount < linesPerPage) {
      const line = lines[lineIndex];
      const y = MARGIN_TOP + pageLineCount * RULED_LINE_GAP + fontSize * 0.8;

      // Subtle x perturbation for realism
      const xOffset = perturbValue(0, 2);
      const yOffset = perturbValue(0, 1.5);

      ctx.font = `${perturbValue(fontSize, 1)}px ${fontFamily}`;
      ctx.fillStyle = inkColor;
      ctx.globalAlpha = perturbValue(0.95, 0.05);

      // Draw character by character with slight variations for very realistic effect
      if (line.trim() === "") {
        // Empty line — skip rendering
      } else {
        drawHandwrittenLine(ctx, line, MARGIN_LEFT + xOffset, y + yOffset, inkColor, fontSize, fontFamily, usableWidth);
      }

      lineIndex++;
      pageLineCount++;
    }

    ctx.globalAlpha = 1;
    pages.push(canvas);
  }

  // At least one page even if no text
  if (pages.length === 0) {
    const canvas = document.createElement("canvas");
    canvas.width = PAGE_WIDTH;
    canvas.height = PAGE_HEIGHT;
    const ctx = canvas.getContext("2d")!;
    drawPaperBackground(ctx, canvas.width, canvas.height, options.showRuledLines);
    pages.push(canvas);
  }

  return { pages, totalPages: pages.length };
}

function drawHandwrittenLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  fontSize: number,
  fontFamily: string,
  maxWidth: number
): void {
  // Check if it's a header line (starts with number or special char)
  const isHeader = /^(\d+\.|[A-Z]\.|#{1,3}\s|\*\s)/.test(text.trim());
  const isBold = text.includes("Jawaban:") || isHeader;

  ctx.font = `${isBold ? "bold " : ""}${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y, maxWidth);
}

function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  showRuledLines: boolean
): void {
  // Paper color
  ctx.fillStyle = "#fefce8";
  ctx.fillRect(0, 0, width, height);

  // Subtle paper texture (noise dots)
  ctx.globalAlpha = 0.02;
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = "#666";
    ctx.fillRect(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2,
      Math.random() * 2
    );
  }
  ctx.globalAlpha = 1;

  if (showRuledLines) {
    ctx.strokeStyle = "#bfdbfe";
    ctx.lineWidth = 0.8;
    for (let y = MARGIN_TOP; y < height - MARGIN_BOTTOM; y += RULED_LINE_GAP) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
}

function wrapTextToLines(
  text: string,
  fontSize: number,
  fontFamily: string
): string[] {
  // Create temp canvas for measurement
  const tempCanvas = document.createElement("canvas");
  const ctx = tempCanvas.getContext("2d")!;
  ctx.font = `${fontSize}px ${fontFamily}`;

  const maxWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const paragraphs = text.split("\n");
  const allLines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      allLines.push("");
      continue;
    }

    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        allLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines;
}

async function loadHandwritingFonts(): Promise<void> {
  if (typeof document === "undefined") return;

  // Check if fonts are already loaded
  const fontsLoaded = document.fonts.check("16px 'Caveat'");
  if (fontsLoaded) return;

  // Load fonts programmatically
  try {
    await document.fonts.load("16px 'Caveat'");
    await document.fonts.load("16px 'Indie Flower'");
  } catch {
    // Fonts may already be loading via CSS
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * Export pages as multi-page PDF
 */
export async function exportToPDF(
  pages: HTMLCanvasElement[],
  filename = "jawaban-ai-handwritten.pdf"
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  // A4 dimensions in mm
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    const canvas = pages[i];
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
  }

  pdf.save(filename);
}

/**
 * Export single page as PNG
 */
export function exportToPNG(
  canvas: HTMLCanvasElement,
  filename = "jawaban-ai-handwritten.png"
): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Export all pages as zip of PNGs (using single page download if only 1 page)
 */
export async function exportAllPNG(
  pages: HTMLCanvasElement[]
): Promise<void> {
  if (pages.length === 1) {
    exportToPNG(pages[0]);
    return;
  }
  // Multiple pages: download each with numbered filename
  for (let i = 0; i < pages.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 300 * i));
    exportToPNG(pages[i], `jawaban-ai-halaman-${i + 1}.png`);
  }
}
