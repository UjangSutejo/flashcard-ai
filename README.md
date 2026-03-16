# 📝 FlashcardAI — Flashcard ai generator for studying effectivley

> Foto materi → AI bikin flashcard otomatis → Belajar lebih gampang & nggak ngantuk

![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)

---

## Tech Stack
 
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI Components | Radix UI primitives |
| AI | Google Gemini 2.5 Pro |
| File Upload | react-dropzone |
| Math Rendering | remark-math + rehype-katex |
| Notifications | Sonner |
| Theme | next-themes |
 
---
 
## Fitur Utama
 
- Upload materi — JPG, PNG, WEBP, HEIC, PDF (max 15MB)
- Gemini 2.5 Pro — Generate flashcard otomatis dari foto materi
- LaTeX Math Support — Render rumus matematika otomatis (KaTeX)
- Edit flashcard — Edit pertanyaan & jawaban sebelum disimpan
- Dark Mode — Toggle tema gelap/terang
- Mobile-first — Responsive untuk semua ukuran layar
 
---
 
## Cara Penggunaan
 
1. Upload foto atau dokumen materi belajar
2. Klik "Generate Flashcard" — tunggu beberapa detik
3. Review flashcard yang dihasilkan — bisa edit jika perlu
4. Mulai sesi belajar dengan mode flip card
 
---
 
## Live Demo
 
https://flashcard-ai-five.vercel.app/
 
---
 
## Struktur Project
 
```
flashcard-ai/
├── app/
│   ├── layout.tsx              # Root layout + ThemeProvider
│   ├── page.tsx                # Halaman utama (state management)
│   └── globals.css             # Global styles + CSS variables
├── components/
│   ├── Navbar.tsx              # Navigation bar + dark mode toggle
│   ├── StepIndicator.tsx       # Progress steps (Upload→AI→Flashcard→Belajar)
│   ├── ThemeProvider.tsx       # next-themes wrapper
│   ├── UploadZone.tsx          # Drag & drop upload + progress
│   ├── FlashcardViewer.tsx     # Tampilan flashcard dengan flip animation
│   └── FlashcardEditor.tsx     # Edit pertanyaan & jawaban flashcard
├── lib/
│   ├── actions.ts              # Server Action: Gemini 2.5 Pro API call
│   ├── flashcard.ts            # Logic generate & parse flashcard
│   └── utils.ts                # cn() helper
├── .env.example                # Template environment variables
└── package.json
```
 
---
 
## License
 
MIT License - bebas digunakan untuk keperluan personal dan edukasi.
 
