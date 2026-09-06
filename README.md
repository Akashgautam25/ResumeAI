# ResumeAI 🚀

> An intelligent, full-stack AI-powered Resume Builder, ATS Optimizer, Job Matcher, and Interview Preparation platform.

![ResumeAI Banner](https://img.shields.io/badge/ResumeAI-v1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind_css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)

---

## ✨ Features

- 📄 **Dynamic Resume Builder & Editor**
  - Section-by-section live editing (Personal Info, Summary, Experience, Education, Projects, Skills, Certifications).
  - Multiple professional ATS-friendly templates (**ATS Classic**, **Modern**, **Developer**, **Minimal**).
  - Version history & snapshot management.

- 🎯 **ATS Scoring & Real-Time Analysis**
  - Instant ATS compatibility scoring (0–100%).
  - Category breakdown: Structure, Keyword Density, Impact Verbs, Measurable Metrics, and Formatting.
  - Section-level weakness detection and AI-suggested bullet point improvements.

- 💼 **Job Match & Resume Tailoring**
  - Paste job descriptions to calculate targeted match scores.
  - Skill gap analysis: Matched, partial, and missing skills.
  - One-click resume tailoring recommendations.

- 🎙️ **AI Interview Preparation**
  - Generate customized interview questions based on your resume and target job descriptions.
  - Structured frameworks (STAR method) with sample answers and difficulty indicators.

- 🔒 **Secure Authentication & Data Privacy**
  - JWT authentication with access/refresh token rotation.
  - Secure document uploads and cloud/local file storage support.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS, PostCSS, Lucide React Icons
- **State & Routing**: React Context API, React Router DOM v6
- **HTTP Client**: Axios with interceptors

### Backend (`/server`)
- **Runtime**: Node.js + Express + TypeScript
- **ORM & Database**: Prisma ORM with PostgreSQL / SQLite support
- **AI Engine**: Groq / OpenAI-compatible LLMs (`llama-3.3-70b-versatile`, `gpt-4o`, etc.)
- **Security & Parsing**: JWT, Bcrypt, Multer, PDF/DOCX parsers, Rate limiting

---

## 📁 Repository Structure

```text
resume-ai/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── api/                # API client configuration
│   │   ├── components/         # Reusable UI & Resume templates
│   │   ├── contexts/           # Auth & Toast state providers
│   │   ├── layouts/            # Public & App layouts
│   │   ├── pages/              # Dashboard, Editor, ATS, Jobs, Interview prep
│   │   ├── routes/             # App routes definition
│   │   ├── services/           # API service modules
│   │   └── types/              # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend Express + Prisma API
│   ├── prisma/                 # Database schema & seed scripts
│   ├── src/
│   │   ├── config/             # Environment configurations
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, validation, error handler, rate limit
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # AI, parser, DB, and storage services
│   │   ├── utils/              # JWT & password utilities
│   │   └── validators/         # Request validation schemas
│   ├── tests/                  # Unit and integration tests
│   └── package.json
│
├── .env.example                # Root environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Root monorepo configuration
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- PostgreSQL (or local SQLite)
- Groq or OpenAI API Key

### 2. Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/Akashgautam25/ResumeAI.git
cd ResumeAI

# Install monorepo dependencies
npm install
```

### 3. Configure Environment Variables

Create `.env` inside the `server/` directory (refer to `.env.example`):

```bash
cp .env.example server/.env
```

Update your `server/.env` with your credentials:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/resume_ai?schema=public"

JWT_SECRET="your_jwt_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"

# AI Provider Configuration (Groq or OpenAI)
AI_PROVIDER="groq"
AI_API_KEY="your_groq_or_openai_api_key"
AI_MODEL="llama-3.3-70b-versatile"

CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:5000"
```

### 4. Database Setup

Run Prisma migrations and generate the client:

```bash
npm run prisma:generate
npm run prisma:migrate
```

*(Optional) Seed the database:*
```bash
npm run seed --workspace=server
```

### 5. Running the Application

Run both client and server concurrently in development mode:

```bash
npm run dev
```

- **Client**: `http://localhost:3000` (or `http://localhost:5173`)
- **Server API**: `http://localhost:5000`

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs both backend and frontend concurrently |
| `npm run dev:client` | Starts Vite frontend dev server |
| `npm run dev:server` | Starts Express backend server with nodemon |
| `npm run build` | Builds both client and server for production |
| `npm run prisma:generate` | Generates Prisma client types |
| `npm run prisma:migrate` | Runs database migrations |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
