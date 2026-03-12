# 📝 HandwriteAI — Homework Solver dengan Tulisan Tangan Realistis

> Upload foto soal PR → AI analisis & selesaikan step-by-step → Download sebagai tulisan tangan realistis di kertas bergaris

![HandwriteAI Banner](https://img.shields.io/badge/HandwriteAI-Beta-blue?style=for-the-badge&logo=openai)
![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)

---

## ✨ Fitur Utama

- 📸 **Upload soal PR** — JPG, PNG, WEBP, HEIC (max 5MB)
- 🤖 **AI GPT-4o Vision** — Analisis & selesaikan soal step-by-step dalam Bahasa Indonesia
- 📐 **LaTeX Math Support** — Render rumus matematika otomatis (KaTeX)
- ✏️ **Edit jawaban** — Edit teks sebelum dikonversi
- 🖊️ **Tulisan Tangan Realistis** — Canvas dengan font Caveat/Indie Flower/Reenie Beanie + perturbation
- 📄 **Multi-halaman PDF** — Export jawaban panjang ke multi-page PDF
- 🎨 **Warna Tinta** — Hitam, Biru, Merah
- 📏 **Kertas Bergaris** — Toggle ruled paper on/off
- 🌙 **Dark Mode** — Toggle tema gelap/terang
- 📱 **Mobile-first** — Responsive untuk semua ukuran layar

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/handwrite-ai.git
cd handwrite-ai
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
# Edit .env.local dan masukkan OpenAI API key kamu
```

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

Dapatkan API key di: https://platform.openai.com/api-keys

### 3. Run Development

```bash
npm run dev
```

Buka http://localhost:3000

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI Components | Radix UI primitives |
| AI | OpenAI GPT-4o Vision |
| File Upload | react-dropzone |
| Math Rendering | remark-math + rehype-katex |
| Handwriting Fonts | Google Fonts (Caveat, Indie Flower, Reenie Beanie) |
| PDF Export | jsPDF |
| Notifications | Sonner |
| Theme | next-themes |

---

## 📁 Struktur Project

```
handwrite-ai/
├── app/
│   ├── layout.tsx          # Root layout + ThemeProvider
│   ├── page.tsx            # Halaman utama (state management)
│   └── globals.css         # Global styles + CSS variables
├── components/
│   ├── Navbar.tsx          # Navigation bar + dark mode toggle
│   ├── StepIndicator.tsx   # Progress steps (Upload→AI→Jawaban→HW)
│   ├── ThemeProvider.tsx   # next-themes wrapper
│   ├── UploadZone.tsx      # Drag & drop upload + progress
│   ├── SolutionViewer.tsx  # Markdown+LaTeX rendered answer
│   └── HandwritingPreview.tsx  # Canvas handwriting + export
├── lib/
│   ├── actions.ts          # Server Action: OpenAI GPT-4o call
│   ├── handwriting.ts      # Canvas rendering + PDF/PNG export
│   └── utils.ts            # cn() helper
├── .env.example            # Template environment variables
└── package.json
```

---

## 🧪 Cara Penggunaan

1. **Upload** foto soal PR (drag & drop atau klik)
2. Klik **"Selesaikan dengan AI"** — tunggu ~10-30 detik
3. **Review jawaban** — bisa edit teks jika perlu
4. Klik **"Convert ke Tulisan Tangan"**
5. Sesuaikan **warna tinta, ukuran, gaya font** di panel Pengaturan
6. **Download** sebagai PDF (prioritas) atau PNG

---

## ⚙️ Konfigurasi Handwriting

| Opsi | Pilihan |
|------|---------|
| Warna Tinta | Hitam, Biru (default), Merah |
| Ukuran Tulisan | Kecil (20px), Sedang (26px), Besar (32px) |
| Gaya Font | Caveat, Indie Flower, Reenie Beanie |
| Kertas Bergaris | On/Off toggle |

---

## 🚀 Deploy ke Vercel

```bash
npm install -g vercel
vercel

# Set environment variable:
# OPENAI_API_KEY = your_key_here
```

Atau melalui Vercel Dashboard:
1. Import repository dari GitHub
2. Add Environment Variable: `OPENAI_API_KEY`
3. Deploy!

---

## 🔒 Keamanan

- **API Key tidak pernah terekspos** ke client — semua AI call via Server Action
- File upload hanya diproses di server dan tidak disimpan
- Validasi tipe file dan ukuran di client & server

---

## 🗺️ Roadmap

- [ ] Auth (Google/GitHub login) untuk save history
- [ ] History jawaban per user
- [ ] Support PDF multi-halaman sebagai input
- [ ] Multiple AI provider (Claude, Gemini)
- [ ] Crop & rotate foto sebelum upload
- [ ] Share link jawaban
- [ ] Pilihan bahasa (English mode)

---

## 📝 License

MIT License - bebas digunakan untuk keperluan personal dan edukasi.

---

## 🙏 Credits

- [OpenAI GPT-4o](https://openai.com) - AI Vision
- [Google Fonts](https://fonts.google.com) - Handwriting fonts
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [KaTeX](https://katex.org) - Math rendering
- [Next.js](https://nextjs.org) - Framework
