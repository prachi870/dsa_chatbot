# DSABot — Data Structures & Algorithms Chatbot

A domain-restricted AI chatbot that **only** answers Data Structures & Algorithms questions. Built with Node.js/Express backend, React/Vite frontend, PostgreSQL, and Groq LLM API.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| AI | Groq API (`openai/gpt-oss-20b`) |
| Auth | JWT |

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Backend setup
```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Run DB migration
node db/migrate.js

# Start backend (port 5000)
npm start
# or for hot-reload:
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev   # starts on port 3000
```

Open `http://localhost:3000`

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo: `prachi870/dsa_chatbot`
3. Set:
   - **Root directory:** `.` (repo root)
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add these **Environment Variables** in the Render dashboard:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string (use [Supabase](https://supabase.com) free tier) |
| `JWT_SECRET` | Any long random string |
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | `openai/gpt-oss-20b` |
| `CORS_ORIGIN` | Your Vercel frontend URL (add after frontend deploy, e.g. `https://dsa-chatbot.vercel.app`) |
| `NODE_ENV` | `production` |

5. Deploy. Note the Render URL (e.g. `https://dsa-chatbot-backend.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `prachi870/dsa_chatbot` from GitHub
3. Set:
   - **Root directory:** `frontend`
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add **Environment Variable:**

| Key | Value |
|---|---|
| `VITE_API_URL` | Your Render backend URL (e.g. `https://dsa-chatbot-backend.onrender.com`) |

5. Deploy.

### Final step — wire them together

After both are deployed:
1. Copy your Vercel URL
2. Go to Render dashboard → Environment → set `CORS_ORIGIN` to your Vercel URL
3. Copy your Render URL
4. Update `frontend/vercel.json` → replace `https://dsa-chatbot-backend.onrender.com` with your actual Render URL → commit & push

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Health check |
| POST | `/api/auth/signup` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/chat` | ✅ JWT | Send message |
| GET | `/api/chat/sessions` | ✅ JWT | List sessions |
| GET | `/api/chat/history/:id` | ✅ JWT | Get messages |
| DELETE | `/api/chat/:id` | ✅ JWT | Delete session |
| GET | `/api/chat/topics` | ✅ JWT | DSA topic list |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/dsa_chatbot
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-20b
CORS_ORIGIN=http://localhost:3000
```
