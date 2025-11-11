# Evidex - AI-Powered Legal Case Analysis

An AI-powered legal analysis platform that examines case documents, transcripts, and evidence to identify potential wrongful convictions and inconsistencies—upholding the presumption of innocence.

## Features

- **Multi-Format Document Analysis** - Upload and analyze PDFs, DOCX, TXT files
- **Audio Transcription** - Transcribe audio recordings (MP3, WAV, M4A, WEBM, OGG) with speaker diarization
- **AI-Powered Legal Intelligence** - Deep case analysis using Google Gemini AI
- **Innocence Scoring** - Automated innocence score calculation (0-100 scale)
- **Evidence Reliability Scoring** - Assess credibility and reliability of evidence
- **Timeline Reconstruction** - Build comprehensive case timelines
- **Critical Alert Detection** - Identify key inconsistencies and red flags
- **Case Management Dashboard** - Track and manage multiple case analyses
- **Precedent Case Matching** - Find similar cases from legal databases

## Tech Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API (gemini-2.5-flash)
- **Storage:** Supabase (file storage and database)
- **UI Components:** Custom React components with responsive design

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **LLM:** Ollama Qwen3 8B (local inference)
- **Embeddings:** Ollama embeddingemma
- **Vector Database:** Neo4j
- **File Storage:** Supabase Storage
- **Relational Database:** Supabase PostgreSQL
- **Document Processing:** PyPDF2, python-docx

## Project Structure

```
HFSI/
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── page.tsx       # Landing page
│   │   ├── analyze/       # Multi-file analysis
│   │   ├── transcribe/    # Audio transcription
│   │   ├── dashboard/     # Case dashboard
│   │   ├── analysis/      # Analysis detail view
│   │   └── api/           # API routes
│   ├── components/
│   ├── types/
│   └── .env.local         # Frontend environment variables
│
├── backend/               # FastAPI application
│   ├── main.py            # FastAPI app
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   └── .env               # Backend environment variables
│
└── README.md
```

## Prerequisites

### Frontend
- Node.js 18+ and npm/yarn/pnpm
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Supabase project ([Create one here](https://supabase.com))

### Backend
- Python 3.10+
- Ollama ([Install here](https://ollama.ai))
- Neo4j database
- Supabase project

## Setup Instructions

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the `frontend/` directory:
   ```env
   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up Supabase:**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Create a storage bucket for audio/document files
   - Get your Project URL and anon key from Project Settings → API

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open the application:**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

See [backend/README.md](backend/README.md) for detailed backend setup instructions.

Quick start:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Ollama models:**
   ```bash
   ollama pull qwen3:8b
   ollama pull embeddingemma
   ```

3. **Install dependencies:**
   ```bash
   uv sync
   # or
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**

   Create a `.env` file in the `backend/` directory (see backend/.env.example)

5. **Run the server:**
   ```bash
   python main.py
   ```

## Usage

### 1. Analyzing Cases

1. Navigate to the **Analyze** page
2. Upload documents (PDF, DOCX, TXT) or paste text directly
3. Optionally upload audio files for transcription
4. Click "Analyze Case" to start AI analysis
5. Review the comprehensive analysis report including:
   - Innocence score
   - Evidence reliability scores
   - Timeline reconstruction
   - Critical alerts and inconsistencies
   - Legal recommendations

### 2. Audio Transcription

1. Navigate to the **Transcribe** page
2. Upload an audio file (MP3, WAV, M4A, WEBM, OGG) - max 50MB
3. Wait for AI-powered transcription with speaker diarization
4. Review the formatted transcript with:
   - Speaker identification (Judge, Attorney, Defendant, etc.)
   - Precise timestamps (HH:MM:SS format)
   - Verbatim dialogue transcription
   - Inaudible/crosstalk markers

### 3. Dashboard

- View all analyzed cases
- Track case status and priority
- Access previous analysis reports
- Manage case documents

## API Routes

### Frontend API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/transcribe` | POST | Transcribe audio with speaker diarization |
| `/api/analyze` | POST | Analyze multiple documents/files |
| `/api/analyze-single` | POST | Analyze a single case file |
| `/api/analyze-stored` | POST | Analyze Supabase-stored files |

### Backend API Routes

See [backend/README.md](backend/README.md) for complete API documentation.

## Environment Variables

### Frontend (.env.local)

```env
GEMINI_API_KEY=                    # Google Gemini API key
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous key
```

### Backend (.env)

```env
NEO4J_URL=                         # Neo4j database URL
NEO4J_USER=                        # Neo4j username
NEO4J_PASSWORD=                    # Neo4j password
SUPABASE_URL=                      # Supabase project URL
SUPABASE_SERVICE_KEY=              # Supabase service key
SUPABASE_BUCKET=                   # Supabase storage bucket name
OLLAMA_BASE_URL=                   # Ollama API URL
OLLAMA_MODEL=                      # Ollama model name
OLLAMA_EMBEDDING_MODEL=            # Ollama embedding model
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend

Deploy to any platform that supports Python/FastAPI:
- Railway
- Render
- Fly.io
- DigitalOcean
- AWS/GCP/Azure

## Known Issues

### 503 Error: "Model is overloaded"

This error occurs when Google's Gemini API is experiencing high load. Solutions:

1. **Wait and retry** - The error is temporary
2. **Implement retry logic** - Add exponential backoff in API calls
3. **Upgrade API tier** - Consider Google AI Studio paid plans
4. **Check API quotas** - Verify your key hasn't exceeded limits

### Large File Uploads

Files larger than 1MB are uploaded directly to Supabase to avoid 413 errors. Ensure your Supabase storage bucket is properly configured.

## Development

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend

```bash
python main.py                          # Start server
uvicorn main:app --reload              # Start with auto-reload
pytest tests/                          # Run tests
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feedback, please open an issue in the repository.

## Acknowledgments

- Built with Google Gemini AI for advanced legal analysis
- Powered by Supabase for data storage and management
- Uses Ollama for local LLM inference in the backend
- Designed for innocence projects, legal professionals, and advocacy groups

---

**Evidex** - Upholding the presumption of innocence through AI
