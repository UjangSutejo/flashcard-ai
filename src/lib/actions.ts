"use server";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Kamu adalah tutor Indonesia super teliti dan sabar untuk siswa SMP/SMA. Analisis gambar soal homework ini dengan teliti.

Langkah wajib:
1. Identifikasi mata pelajaran (Matematika, Fisika, Kimia, Bahasa Inggris, dll) dan sub-topik.
2. Tulis ulang soal secara lengkap & jelas dalam bahasa Indonesia (terjemahkan jika asli Inggris).
3. Jika gambar buram/tidak jelas, katakan "Gambar kurang jelas, mohon upload ulang yang lebih tajam."
4. Berikan SOLUSI LENGKAP LANGKAH DEMI LANGKAH:
   - Nomori setiap langkah (1., 2., 3...)
   - Gunakan bahasa sederhana, mudah dipahami siswa.
   - Bold **rumus penting** dan gunakan $...$ atau $$...$$ untuk LaTeX math.
   - Jelaskan konsep dasar jika diperlukan.
   - Hindari jawaban langsung tanpa proses – harus mendidik.
5. Jika soal multi-bagian, pisah jelas (A., B., dst).
6. Akhiri dengan jawaban akhir dalam format:
   \\boxed{hasil akhir di sini}
7. Jawab 100% dalam bahasa Indonesia.
8. Jaga panjang jawaban maks 1000-1500 kata agar muat di 2-4 halaman handwriting.

Langsung mulai analisis dari gambar.`;

export async function solveHomework(
  formData: FormData
): Promise<{ solution?: string; error?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      error:
        "OPENAI_API_KEY belum diset. Tambahkan ke .env.local dan restart server.",
    };
  }

  const imageFile = formData.get("image") as File | null;
  if (!imageFile) {
    return { error: "Tidak ada file yang diupload." };
  }

  // Validate file type
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  if (!validTypes.includes(imageFile.type) && !imageFile.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
    return {
      error: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.",
    };
  }

  // Convert file to base64
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = imageFile.type || "image/jpeg";

  // Determine image media type for OpenAI
  const allowedMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
  type AllowedType = typeof allowedMediaTypes[number];
  const safeMediaType: AllowedType = allowedMediaTypes.includes(mediaType as AllowedType)
    ? (mediaType as AllowedType)
    : "image/jpeg";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout

    const response = await client.chat.completions.create(
      {
        model: "gpt-4o",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${safeMediaType};base64,${base64}`,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: SYSTEM_PROMPT,
              },
            ],
          },
        ],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const text = response.choices[0]?.message?.content;
    if (!text) {
      return { error: "AI tidak memberikan jawaban. Coba lagi." };
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
    console.error("OpenAI error:", err);

    if (err instanceof Error) {
      if (err.name === "AbortError" || err.message.includes("timeout")) {
        return {
          error:
            "AI timeout setelah 55 detik. Coba lagi atau gunakan gambar yang lebih sederhana.",
        };
      }
      if (err.message.includes("rate_limit")) {
        return {
          error: "API rate limit tercapai. Tunggu beberapa menit dan coba lagi.",
        };
      }
      if (err.message.includes("insufficient_quota")) {
        return {
          error: "Kuota OpenAI habis. Periksa billing akun Anda.",
        };
      }
    }

    return {
      error: "Gagal menghubungi AI. Periksa koneksi dan API key Anda.",
    };
  }
}
