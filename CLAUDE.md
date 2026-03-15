# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HandwriteAI is a Next.js application that converts homework problems into realistic handwritten solutions. Users upload photos of homework problems, which are analyzed by AI (Google Gemini), and the solutions are then rendered as realistic handwriting on virtual paper that can be exported as PDF or PNG.

Key features:
- Upload homework problem images (JPG, PNG, WEBP, HEIC)
- AI analysis using Google Gemini 2.5 Flash Lite
- LaTeX math support with KaTeX rendering
- Editable solution preview before handwriting conversion
- Realistic handwriting rendering with multiple font options
- Multi-page PDF export capability
- Dark mode support

## Project Structure

```
handwrite-ai/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout with ThemeProvider
│   ├── page.tsx         # Main application page with state management
│   └── globals.css      # Global styles and CSS variables
├── components/          # React components
│   ├── UploadZone.tsx   # File upload with drag & drop
│   ├── SolutionViewer.tsx  # Markdown+LaTeX rendered answer display
│   ├── HandwritingPreview.tsx  # Canvas handwriting rendering + export
│   ├── StepIndicator.tsx   # Progress indicator (Upload→AI→Solution→Handwriting)
│   └── ...
├── lib/                 # Utility functions and business logic
│   ├── actions.ts       # Server Actions (AI processing)
│   ├── handwriting.ts   # Canvas rendering and export functions
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── ...
```

## Common Commands

### Development
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### Environment Setup
```bash
cp .env.example .env.local  # Copy environment template
# Edit .env.local and add your GEMINI_API_KEY
```

Required environment variables:
- `GEMINI_API_KEY`: Google Gemini API key for AI processing

## Architecture Overview

The application follows a four-step workflow:

1. **Upload**: Users upload homework problem images via drag-and-drop
2. **AI Processing**: Server Action processes image with Google Gemini API
3. **Solution Review**: Users can review and edit the AI-generated solution
4. **Handwriting Conversion**: Solution is rendered as realistic handwriting on canvas

### Key Components

- `page.tsx`: Main application component managing state and workflow
- `UploadZone.tsx`: Handles file uploads with validation and preview
- `SolutionViewer.tsx`: Displays AI solution with Markdown and LaTeX rendering
- `HandwritingPreview.tsx`: Renders solution as handwriting on canvas with export options
- `actions.ts`: Server Action that communicates with Google Gemini API
- `handwriting.ts`: Client-side canvas rendering and export functionality

### Data Flow

1. User uploads image → stored in component state
2. Image sent to server via FormData to `solveHomework` Server Action
3. Server processes image with Google Gemini API
4. AI response returned to client as markdown text
5. User reviews/edit solution in `SolutionViewer`
6. Solution rendered as handwriting on canvas in `HandwritingPreview`
7. User exports as PDF or PNG

## Key Technologies

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **AI**: Google Gemini 2.5 Flash Lite
- **File Upload**: react-dropzone
- **Math Rendering**: remark-math + rehype-katex
- **Handwriting Fonts**: Google Fonts (Caveat, Indie Flower, Reenie Beanie)
- **PDF Export**: jsPDF
- **Notifications**: Sonner
- **Theme**: next-themes

## Deployment

Deploy to Vercel:
```bash
npm install -g vercel
vercel

# Set environment variable in Vercel dashboard:
# GEMINI_API_KEY = your_gemini_api_key_here
```

## Security Considerations

- API keys are handled server-side only (Server Actions)
- File uploads are validated on both client and server
- No user data is persisted on the server
- Image processing happens in memory and is not stored

## Testing

Run the development server and test the complete workflow:
1. Upload a homework image
2. Wait for AI processing
3. Review/edit the solution
4. Convert to handwriting
5. Export as PDF/PNG