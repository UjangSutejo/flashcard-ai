"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type DifficultyLevel = "easy" | "medium" | "hard" | "mixed";
type QuestionSource = "kurikulum_indonesia" | "internasional";

function buildSystemPrompt(
  count: number,
  difficulty: DifficultyLevel,
  source: QuestionSource
): string {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.min(Math.max(count, 1), 30) : 6;

  const difficultyText =
    difficulty === "mixed"
      ? "Campur antara easy/medium/hard dengan distribusi yang seimbang."
      : `SEMUA flashcard HARUS berada pada tingkat kesulitan: ${difficulty}. Jangan membuat kartu dengan tingkat kesulitan lain.`;

  const sourceText =
    source === "internasional"
      ? "Gunakan gaya soal dan cara berpikir yang umum dipakai di kurikulum internasional (misalnya Cambridge/IB), tetapi tetap jawab dengan bahasa Indonesia."
      : "Gunakan konteks dan gaya soal yang selaras dengan Kurikulum Merdeka / kurikulum Indonesia.";

  return `Kamu adalah ahli pendidikan Indonesia yang sangat berpengalaman dalam membuat flashcard untuk siswa SMP/SMA. Analisis materi belajar ini (bisa berupa foto catatan, kisi-kisi, ringkasan, atau PDF materi) dengan teliti dan buat flashcard yang efektif untuk belajar.

Parameter dari pengguna:
- Jumlah flashcard yang diinginkan: tepat ${safeCount} kartu. JANGAN membuat lebih atau kurang dari ${safeCount} flashcard.
- Tingkat kesulitan: ${difficulty}.
- Instruksi tingkat kesulitan: ${difficultyText}
- Sumber gaya soal: ${source}.
- Instruksi sumber soal: ${sourceText}

Langkah wajib:
1. Identifikasi mata pelajaran (Matematika, Fisika, Kimia, Biologi, Bahasa Inggris, dll) dan topik utama.
2. Buat FLASHCARD pilihan ganda berkualitas tinggi dalam format berikut (bukan jawaban langsung dari soal yang di-upload, tetapi kartu belajar berbasis konsep dan contoh soal singkat):

   Format Flashcard (WAJIB diikuti persis):
   ---
   Pertanyaan: [Pertanyaan yang menantang pemahaman konsep, bukan hanya hafalan]
   Opsi A: [Pilihan jawaban A]
   Opsi B: [Pilihan jawaban B]
   Opsi C: [Pilihan jawaban C]
   Opsi D: [Pilihan jawaban D]
   Jawaban Benar: [HANYA huruf A/B/C/D yang merupakan jawaban paling tepat]
   Pembahasan: [Penjelasan singkat/bagian penting cara berpikir atau langkah utama]
   Kesulitan: [easy/medium/hard]
   Topik: [Topik utama yang diujikan]
   ---

   Contoh format yang benar:
   ---
   Pertanyaan: Apa rumus untuk menghitung luas lingkaran?
   Opsi A: L = π × r
   Opsi B: L = 2 × π × r
   Opsi C: L = π × r²
   Opsi D: L = 2 × π × r²
   Jawaban Benar: C
   Pembahasan: Rumus luas lingkaran menggunakan jari-jari yang dikuadratkan (r²), sehingga hanya opsi C yang benar. Opsi lain adalah bentuk keliling atau rumus yang salah.
   Kesulitan: easy
   Topik: Geometri
   ---

3. Buat sekitar ${safeCount} flashcard tergantung kompleksitas materi.
4. Fokus pada konsep penting, rumus, definisi, dan fakta kunci yang sering keluar di ujian.
5. Gunakan bahasa Indonesia yang jelas dan mudah dipahami siswa.
6. Untuk soal sulit, tambahkan penjelasan singkat penting (di bagian Pembahasan).
7. Jangan membuat flashcard terlalu umum atau terlalu spesifik.
8. Jangan menuliskan pembahasan panjang seperti pembahasan resmi Ujian Nasional; cukup poin-poin utama yang memudahkan siswa memahami ide besarnya.
9. Jawab 100% dalam bahasa Indonesia.
10. Format keluaran hanya dalam bentuk flashcard seperti contoh di atas, tanpa tambahan teks lainnya.`;
}

export async function generateFlashcards(
  formData: FormData
): Promise<{ solution?: string; error?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      error:
        "GEMINI_API_KEY belum diset. Tambahkan ke .env.local dan restart server.",
    };
  }

  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return { error: "Tidak ada file yang diupload." };
  }

  // User options
  const countRaw = formData.get("count");
  const difficultyRaw = formData.get("difficulty");
  const sourceRaw = formData.get("source");

  const count = typeof countRaw === "string" ? parseInt(countRaw, 10) || 6 : 6;
  const difficulty: DifficultyLevel =
    difficultyRaw === "easy" ||
    difficultyRaw === "medium" ||
    difficultyRaw === "hard" ||
    difficultyRaw === "mixed"
      ? difficultyRaw
      : "mixed";
  const source: QuestionSource =
    sourceRaw === "internasional" || sourceRaw === "kurikulum_indonesia"
      ? sourceRaw
      : "kurikulum_indonesia";

  // Validate file type
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
  ];
  if (!validTypes.includes(imageFile.type) && !imageFile.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
    return {
      error: "Format file tidak didukung. Gunakan JPG, PNG, WEBP, HEIC, atau PDF.",
    };
  }

  // Convert file to base64
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = imageFile.type || "image/jpeg";

  // Determine media type for Gemini
  const allowedMediaTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ] as const;
  type AllowedType = typeof allowedMediaTypes[number];
  const safeMediaType: AllowedType = allowedMediaTypes.includes(mediaType as AllowedType)
    ? (mediaType as AllowedType)
    : "image/jpeg";

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        maxOutputTokens: 2000,
      }
    });

    const result = await model.generateContent([
      buildSystemPrompt(count, difficulty, source),
      {
        inlineData: {
          data: base64,
          mimeType: safeMediaType,
        },
      },
    ]);

    const text = result.response.text();
    if (!text) {
      return { error: "AI tidak memberikan flashcard. Coba lagi." };
    }

    // Check if image is unclear
    if (
      text.toLowerCase().includes("gambar kurang jelas") ||
      text.toLowerCase().includes("mohon upload ulang")
    ) {
      return {
        error:
          "Gambar kurang jelas atau buram. Mohon foto ulang dengan pencahayaan lebih baik dan pastikan teks terbaca jelas.",
      };
    }

    return { solution: text };
  } catch (err: unknown) {
    console.error("Gemini error:", err);

    if (err instanceof Error) {
      if (err.message.includes("finishReason: SAFETY")) {
        return {
          error: "Konten diblokir oleh filter keamanan Google. Pastikan gambar tidak melanggar kebijakan.",
        };
      }
      if (err.message.includes("quota") || err.message.includes("429")) {
        return {
          error: "Kuota Gemini habis atau rate limit tercapai. Tunggu beberapa menit.",
        };
      }
    }

    return {
      error: "Gagal menghubungi AI (Gemini). Periksa koneksi dan API key Anda.",
    };
  }
}
