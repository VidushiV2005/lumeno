# ✦ LUMENO — AI-Powered Study Companion

> Upload PDFs. Get AI summaries, flashcards, and quizzes — instantly.

Built with React · TypeScript · Firebase Auth · Tailwind CSS · Vite

---

## What is Lumeno?

Lumeno is a **frontend-only** AI study web app. Students upload PDFs and the app generates smart summaries, flashcard decks, quizzes, and an AI chat interface — all within a dark glassmorphism UI. Authentication is handled via **Firebase Google Sign-In**. There is no custom backend.

---

## Features

| Page | What it does |
|---|---|
| **PDF Upload** | Drag-and-drop PDFs with upload progress and processing stages |
| **AI Chat** | Ask questions about your documents with source attribution |
| **Summaries** | AI-generated summaries in Brief / Standard / Detailed modes |
| **Flashcards** | Spaced-repetition decks with 3D flip animation and confidence ratings |
| **Quizzes** | MCQ quizzes with explanations, timer, and graded results screen |
| **PDF Viewer** | 3-panel reader with outline, annotations, bookmarks, and zoom |
| **Account** | Profile, notification preferences, and account management |

---

## Tech Stack

- **React 18 + TypeScript** — UI and type safety
- **Vite** — build tool
- **Tailwind CSS** — styling
- **Redux Toolkit** — global auth state
- **Firebase Auth** — Google Sign-In (only backend service used)
- **GSAP** — animations
- **Lucide React** — icons

---

## Getting Started

```bash
git clone https://github.com/your-username/lumeno.git
cd lumeno
npm install
cp .env.example .env   # fill in Firebase config
npm run dev
```

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Go to **Authentication → Sign-in method → Google → Enable**
3. Register a web app and copy the config values
4. Add them to your `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> ⚠️ Never commit your `.env` file.

---

## Project Structure

```
src/
├── components/      # Sidebar, LiquidEther background
├── features/        # firebase.ts, userSlice.ts (Redux)
├── pages/           # Login, Dashboard, Upload, Chat,
│                    # Summaries, Flashcards, Quizzes,
│                    # PDFViewer, Account
└── store.ts
```

---

## Authentication

Sign-in uses `signInWithPopup` with Firebase's Google provider. The user's `uid`, `email`, `name`, and `photo` are stored in Redux. All routes except `/login` are protected and redirect unauthenticated users.

---

Crafted with 💜 by **Vidushi Verma**
