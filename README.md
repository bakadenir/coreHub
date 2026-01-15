# CoreHub 🚀

Aplikasi produktivitas all-in-one untuk mengelola jadwal, catatan, link, todo, dan kebiasaan harian. Dibangun dengan arsitektur monorepo menggunakan **React + Vite** untuk frontend dan **Express.js + Supabase** untuk backend.

## ✨ Features

### 📋 Productivity Tools
- **📅 Schedule Management** - Kelola jadwal dengan reminder dan view kalender
- **📝 Notes** - Rich Text Editor (TipTap) & Markdown dengan Mermaid diagrams
- **🔗 Links Manager** - Simpan dan organisir bookmark dengan tag
- **✅ Todo Lists** - Task management dengan subtasks, prioritas, dan due dates
- **🎯 Habits Tracker** - Track kebiasaan harian/mingguan dengan streak counting
- **🏠 Dashboard** - Overview dengan drag-and-drop activity cards

### 🔧 Additional Features
- **⏱️ Pomodoro Timer** - Built-in timer untuk fokus
- **🔔 Real-time Notifications** - Push notifications & SSE updates
- **🔍 Global Search** - Cari di semua notes, links, todos, schedules
- **👤 Admin Panel** - User management & activity logs
- **🌐 Public Notes** - Share notes via public URL/slug
- **💳 Donations** - Integrasi Midtrans untuk donasi

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, React Router v7, TipTap Editor |
| **Backend** | Express.js, TypeScript, Node.js |
| **Database** | Supabase (PostgreSQL + Auth + RLS) |
| **State Management** | SWR, React Context |
| **UI Components** | Lucide Icons, dnd-kit (drag & drop) |
| **Payments** | Midtrans |

## 📁 Project Structure

```
coreHub/
├── apps/
│   ├── api/               # Backend (Express + Supabase)
│   │   ├── src/
│   │   │   ├── config/          # Supabase client & env config
│   │   │   ├── middleware/      # Auth & admin middleware
│   │   │   ├── routes/          # 15 API route handlers
│   │   │   ├── services/        # 13 business logic services
│   │   │   └── index.ts         # Entry point
│   │   └── package.json
│   │
│   └── web/               # Frontend (React + Vite + Tailwind)
│       ├── src/
│       │   ├── components/      # 35+ reusable components
│       │   ├── pages/           # 21 page components
│       │   ├── context/         # Auth, Toast, Notification contexts
│       │   ├── hooks/           # 12 custom hooks
│       │   ├── lib/             # API client, Supabase client, utilities
│       │   └── App.tsx          # Router setup
│       └── package.json
│
├── supabase/              # Database schema & migrations
│   ├── schema.sql               # Complete database schema
│   ├── rls_policies.sql         # Row Level Security policies
│   └── migrations/              # SQL migrations
│
└── package.json           # Root workspace config
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v22+ ([download](https://nodejs.org))
- **npm** v10+
- **Supabase Account** ([signup](https://supabase.com))

### 1. Clone & Install

```bash
git clone https://github.com/bakadenir/coreHub.git
cd coreHub
npm install
```

### 2. Setup Supabase

1. Buat project di [Supabase Dashboard](https://supabase.com/dashboard)
2. Jalankan `supabase/schema.sql` di SQL Editor
3. Jalankan `supabase/rls_policies.sql` untuk Row Level Security
4. Dapatkan API keys dari **Settings → API**

### 3. Configure Environment

**Backend (`apps/api/.env`):**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional - Midtrans (for donations)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Optional - Push Notifications (VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@corehub.app
```

**Frontend (`apps/web/.env`):**
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start Development

```bash
# Terminal 1 - Backend
npm run dev:api

# Terminal 2 - Frontend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## 📋 Available Commands

### Root Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start frontend dev server |
| `npm run dev:api` | Start backend dev server |
| `npm run dev:all` | Start both servers |
| `npm run build` | Build all workspaces |
| `npm run test` | Run tests |

### Backend Commands (`apps/api`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload (tsx watch) |
| `npm run start` | Start production server |
| `npm run test` | Run Vitest tests |

### Frontend Commands (`apps/web`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `notes` | Markdown/Rich text notes dengan public sharing |
| `habits` | Habit definitions dengan frequency & reminders |
| `habit_completions` | Habit completion tracking |
| `schedule_events` | Calendar events dengan recurrence |
| `links` | Saved bookmarks dengan tags |
| `todo_lists` | Todo list containers |
| `todos` | Todo items dengan subtasks & priorities |
| `notifications` | In-app notifications |
| `notification_settings` | User notification preferences |
| `push_subscriptions` | Web push subscriptions |
| `feedback` | User feedback & bug reports |
| `donations` | Donation transactions (Midtrans) |

---

## 🛣️ API Endpoints

### Authentication (via Supabase)
- All protected endpoints require `Authorization: Bearer <token>` header

### Core Resources
| Endpoint | Description |
|----------|-------------|
| `/api/habits` | Habits CRUD + completions |
| `/api/schedules` | Schedule events CRUD |
| `/api/notes` | Notes CRUD + public sharing |
| `/api/links` | Links CRUD |
| `/api/todos` | Todos & Lists CRUD |
| `/api/users` | User profile |
| `/api/search?q=` | Global search |

### Notifications
| Endpoint | Description |
|----------|-------------|
| `/api/notifications` | In-app notifications |
| `/api/notification-settings` | User preferences |
| `/api/push` | Push subscription management |
| `/api/sse` | Server-Sent Events stream |

### Other
| Endpoint | Description |
|----------|-------------|
| `/api/admin/*` | Admin dashboard (protected) |
| `/api/feedback` | Submit feedback |
| `/api/donations/*` | Donation endpoints |
| `/api/public/notes/:slug` | Public note access |

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| `user` | Basic features |
| `pro` | Premium features |
| `admin` | Full admin panel |
| `banned` | No access |

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Public landing page |
| Login/Register | `/auth` | Authentication |
| Dashboard | `/home` | Main dashboard |
| Notes | `/notes` | Notes management |
| Habits | `/habits` | Habit tracking |
| Schedule | `/schedule` | Calendar view |
| Links | `/links` | Bookmark manager |
| Todos | `/todos` | Task management |
| Profile | `/profile` | User profile |
| Settings | `/settings` | App settings |
| Admin | `/admin` | Admin dashboard |
| Donate | `/donate` | Donation page |
| Article | `/article/:slug` | Public shared note |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
Stop-Process -Name "node" -Force

# atau gunakan npx
npx kill-port 3001  # Backend
npx kill-port 5173  # Frontend
```

### Supabase Connection Error
- Pastikan `SUPABASE_URL` dan keys sudah benar
- Cek di Supabase Dashboard bahwa project aktif

### "Email not confirmed" on Login
- Disable "Confirm email" di Supabase Dashboard → Authentication → Providers → Email
- Atau confirm user secara manual di Dashboard

### Module Not Found
```bash
# Reinstall dari root
npm install
```

---

## 🌐 Deployment

| Component | Service | Recommended |
|-----------|---------|-------------|
| Database + Auth | Supabase Cloud | ✅ |
| Frontend | Netlify / Vercel | ✅ |
| Backend | Railway / Render | ✅ |

### Netlify Configuration
File `netlify.toml` sudah tersedia untuk deployment frontend.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**bakadenir** - [GitHub](https://github.com/bakadenir) - bakadenir@gmail.com

---

Happy coding! 🎉
