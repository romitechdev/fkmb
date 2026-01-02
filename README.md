# FKMB UNESA - Sistem Informasi

Sistem Informasi untuk Forum Keluarga Mahasiswa Banyuwangi UNESA.

## Struktur Proyek

```
fkmb/
├── frontend/    # React + Vite + TypeScript
└── backend/     # Express + TypeScript + Drizzle ORM
```

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 7 (bundler)
- TailwindCSS 4
- React Router DOM
- Axios
- Recharts (charts)
- react-hot-toast

### Backend
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL
- JWT Authentication
- Multer (file upload)

## Deployment

### Frontend (Vercel)
Deploy frontend langsung ke Vercel. Set environment variable:
- `VITE_API_URL`: URL backend API

### Backend
Backend perlu di-deploy terpisah ke platform yang support Node.js (Railway, Render, dll).

Set environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret untuk JWT (min 32 karakter)
- `JWT_REFRESH_SECRET`: Secret untuk refresh token (min 32 karakter)
- `FRONTEND_URL`: URL frontend (untuk CORS)
- `NODE_ENV`: production

## Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```
