# CoreHub 🚀

Aplikasi produktivitas all-in-one untuk mengelola jadwal, catatan, link, dan kebiasaan harian.

## ✨ Features

- **📅 Schedule Management** - Kelola jadwal dengan reminder
- **📝 Notes** - Markdown support dengan Mermaid diagrams & syntax highlighting
- **🔗 Links Manager** - Simpan dan organisir bookmark
- **🎯 Habits Tracker** - Track kebiasaan dengan streak counting
- **🏠 Dashboard** - Overview dengan drag-and-drop activity cards
- **⏱️ Pomodoro Timer** - Built-in timer untuk fokus
- **🔔 Notifications** - Push notifications & real-time updates
- **👤 Admin Panel** - User management & activity logs

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS, React Router v7 |
| **Backend** | Express.js, Better Auth, Drizzle ORM |
| **Database** | PostgreSQL 14+ |
| **Auth** | Better Auth (session-based) |

## 📁 Project Structure

```
coreHub/
├── apps/
│   ├── api/           # Backend (Express + Drizzle + PostgreSQL)
│   │   ├── src/
│   │   │   ├── config/       # Environment & auth config
│   │   │   ├── db/schema/    # Database schema (10 tables)
│   │   │   ├── middleware/   # Auth & admin middleware
│   │   │   ├── routes/       # 14 API route handlers
│   │   │   ├── services/     # Business logic
│   │   │   └── index.ts      # Entry point
│   │   └── package.json
│   │
│   └── web/           # Frontend (React + Vite + Tailwind)
│       ├── src/
│       │   ├── components/   # 27 reusable components
│       │   ├── pages/        # 16 page components
│       │   ├── context/      # React contexts
│       │   ├── hooks/        # Custom hooks
│       │   ├── lib/          # API client & utilities
│       │   └── App.tsx       # Router setup
│       └── package.json
│
└── package.json       # Root workspace config
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **PostgreSQL** v14+ ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com))

### 1. Clone & Install

```bash
git clone https://github.com/bakadenir/coreHub.git
cd coreHub
npm install
```

### 2. Setup Database

```sql
-- Run di psql atau pgAdmin
CREATE DATABASE corehub;
```

### 3. Configure Environment

```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env`:
```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/corehub
BETTER_AUTH_SECRET=your-super-secret-key
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

### 4. Push Database Schema

```bash
cd apps/api
npm run db:push
```

### 5. Start Development

```bash
# Terminal 1 - Backend
cd apps/api && npm run dev

# Terminal 2 - Frontend (dari root)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start frontend dev server |
| `npm run dev:api` | Start backend dev server |
| `npm run dev:all` | Start both servers |

### Backend Commands (apps/api)

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migrations |
| `npm run db:studio` | Open Drizzle Studio (GUI) |

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `user` | User accounts & profiles |
| `session` | Auth sessions |
| `account` | OAuth accounts |
| `habit` | Habit definitions & progress |
| `schedule` | Calendar events |
| `note` | Markdown notes |
| `link` | Saved bookmarks |
| `notification_settings` | User preferences |
| `notifications` | In-app notifications |
| `push_subscriptions` | Web push subscriptions |
| `feedback` | User feedback |

---

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth-custom/login` - Login
- `POST /api/auth-custom/register` - Register
- `ALL /api/auth/*` - Better Auth handler

### Resources
- `/api/habits` - Habits CRUD
- `/api/schedules` - Schedules CRUD
- `/api/notes` - Notes CRUD
- `/api/links` - Links CRUD
- `/api/users` - User profile
- `/api/search` - Global search

### Admin (Protected)
- `/api/admin/stats` - Dashboard stats
- `/api/admin/users` - User management
- `/api/admin/activity-logs` - Activity logs

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| `user` | Basic features |
| `pro` | Premium features |
| `admin` | Full admin panel |
| `banned` | No access |

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Pastikan PostgreSQL running
# Cek DATABASE_URL di .env
```

### Port Already in Use
```bash
npx kill-port 3001  # Backend
npx kill-port 5173  # Frontend
```

### CORS Error
- Pastikan `FRONTEND_URL=http://localhost:5173` di `.env`
- Restart backend setelah edit `.env`

---

## 📄 License

MIT License

---

Happy coding! 🎉
