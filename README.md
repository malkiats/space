# MySpace Full-Stack App

Production-ready full-stack app with FastAPI + Next.js + PostgreSQL + Cloudflare R2.

## Stack

- Backend: FastAPI, SQLAlchemy, Pydantic, JWT, bcrypt
- Frontend: Next.js (App Router), TypeScript, Tailwind, React Query
- Database: PostgreSQL (Supabase)
- Object Storage: Cloudflare R2 (S3-compatible)

## Project Structure

- `backend/` FastAPI app
- `frontend/` Next.js app
- `docker-compose.yml` local orchestration

## Quick Start

### Backend

1. Copy env:
   - `cp backend/.env.example backend/.env`
2. Install deps:
   - `cd backend && pip install -r requirements.txt`
3. Run:
   - `uvicorn app.main:app --reload --port 8000`

### Frontend

1. Copy env:
   - `cp frontend/.env.example frontend/.env`
2. Install deps:
   - `cd frontend && npm install`
3. Run:
   - `npm run dev`

## API Modules

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/users` (admin)
- `PATCH /api/v1/users/{id}/role` (admin)
- `DELETE /api/v1/users/{id}` (admin)
- `GET/POST/PATCH/DELETE /api/v1/notes`
- `POST /api/v1/files/upload`
- `GET /api/v1/files`
- `GET /api/v1/files/{id}/download`
- `DELETE /api/v1/files/{id}`

## Docker

- `docker compose up --build`

