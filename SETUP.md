# CoreHub Setup Guide 🚀

Panduan lengkap untuk setup project CoreHub di komputer baru.

## Prerequisites

Pastikan sudah terinstall:
- **Node.js** v18+ (https://nodejs.org)
- **PostgreSQL** v14+ (https://www.postgresql.org/download/)
- **Git** (https://git-scm.com)

---

## Step 1: Clone Repository

```bash
git clone https://github.com/bakadenir/coreHub.git
cd coreHub
```

---

## Step 2: Install Dependencies

```bash
# Install all dependencies (root + apps)
npm install
```

---

## Step 3: Setup PostgreSQL Database

### Windows (pgAdmin atau psql):

```sql
-- Buka psql atau pgAdmin, run:
CREATE DATABASE corehub_db;
```

### macOS/Linux:

```bash
sudo -u postgres createdb corehub_db
```

---

## Step 4: Configure Environment Variables

### Copy example dan edit:

```bash
cd apps/api
cp .env.example .env
```

### Edit `apps/api/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/corehub_db

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

> ⚠️ Ganti `YOUR_PASSWORD` dengan password PostgreSQL kamu!

---

## Step 5: Run Database Migrations

```bash
cd apps/api

# Generate migration files (jika belum ada)
npm run db:generate

# Push schema ke database
npm run db:push
```

---

## Step 6: Start Development Servers

### Terminal 1 - Backend API:

```bash
cd apps/api
npm run dev
```

API akan jalan di: `http://localhost:3001`

### Terminal 2 - Frontend:

```bash
# Dari root folder
npm run dev
# ATAU
cd apps/web
npm run dev
```

Frontend akan jalan di: `http://localhost:5173`

---

## Step 7: Verify Everything Works

1. **Buka browser:** `http://localhost:5173`
2. **Register akun baru**
3. **Login**
4. **Test features:** Add habit, schedule, note, link

---

## Optional: Database Studio

Untuk melihat data di database:

```bash
cd apps/api
npm run db:studio
```

Buka: `http://localhost:4983`

---

## Troubleshooting

### Error: ECONNREFUSED (database connection failed)

- Pastikan PostgreSQL running
- Cek `DATABASE_URL` di `.env`
- Cek password PostgreSQL

### Error: JWT_SECRET not defined

- Pastikan `.env` sudah dibuat di `apps/api/`
- Pastikan `JWT_SECRET` ada dan tidak kosong

### Error: CORS blocked

- Pastikan `FRONTEND_URL=http://localhost:5173` di `.env`
- Restart backend setelah edit `.env`

### Port already in use

```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

---

## Project Structure

```
coreHub/
├── apps/
│   ├── api/           # Backend (Hono + Drizzle + PostgreSQL)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── db/schema/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── .env        # Environment variables (JANGAN COMMIT!)
│   │   └── package.json
│   │
│   └── web/           # Frontend (React + Vite + Tailwind)
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── lib/
│       │   ├── context/
│       │   └── App.tsx
│       └── package.json
│
├── package.json       # Root package (workspaces)
└── README.md
```

---

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start frontend dev server |
| `cd apps/api && npm run dev` | Start backend dev server |
| `cd apps/api && npm run db:push` | Push schema to database |
| `cd apps/api && npm run db:studio` | Open database GUI |

---

Happy coding! 🎉
