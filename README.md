# CoreHub — All-in-One Productivity App 🚀

> **Full-Stack Monorepo:** A comprehensive productivity suite with schedules, notes, links, todos, and habit tracking — built with React 19 + Express.js + Supabase.

---

## ✨ Features

### 📋 Productivity Tools
- **📅 Schedule Management** — Calendar view with reminders and recurring events
- **📝 Notes** — Rich Text Editor (TipTap) & Markdown with Mermaid diagram support
- **🔗 Links Manager** — Bookmark organizer with tags and search
- **✅ Todo Lists** — Task management with subtasks, priorities, and due dates
- **🎯 Habits Tracker** — Daily/weekly habit tracking with streak counting
- **🏠 Dashboard** — Drag-and-drop activity cards with overview stats

### 🔧 Additional Features
- **⏱️ Pomodoro Timer** — Built-in focus timer
- **🔔 Real-time Notifications** — Push notifications & SSE (Server-Sent Events)
- **🔍 Global Search** — Search across all notes, links, todos, and schedules
- **👤 Admin Panel** — User management & activity logs
- **🌐 Public Notes** — Share notes via public URL/slug
- **💳 Donations** — Midtrans payment gateway integration
- **📧 Email OTP** — Secure email verification via Resend
- **🌙 Dark Mode** — Full dark mode support
- **📱 PWA** — Installable Progressive Web App with offline support

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, React Router v7, TipTap Editor |
| **Backend** | Express.js, TypeScript, Node.js, Resend (Email) |
| **Database** | Supabase (PostgreSQL + Auth + Row-Level Security) |
| **State** | SWR, React Context |
| **Testing** | Vitest |
| **Payments** | Midtrans |
| **Deployment** | Netlify |

---

## 📂 Project Structure (Monorepo)

```
coreHub/
├── apps/
│   ├── api/                  # Express.js + TypeScript backend
│   │   ├── src/
│   │   │   ├── routes/       # Auth, habits, notes, todos, links, schedules...
│   │   │   ├── services/     # Business logic layer
│   │   │   ├── middleware/   # Auth, admin middleware
│   │   │   ├── config/       # Supabase, Sentry, Swagger config
│   │   │   └── types/        # TypeScript type definitions
│   │   └── vitest.config.ts
│   └── web/                  # React + Vite frontend
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   ├── pages/        # Route pages (Dashboard, Habits, Notes...)
│       │   ├── hooks/        # Custom React hooks
│       │   ├── lib/          # API clients, utilities
│       │   └── context/      # Auth, Notification, Toast contexts
│       └── public/           # PWA assets (manifest, service worker, icons)
├── supabase/
│   ├── migrations/           # Database schema migrations
│   └── schema.sql            # Full database schema
├── docs/
│   ├── MONITORING.md         # Monitoring guide
│   └── SECURITY_AUDIT.md     # Security audit documentation
└── netlify.toml              # Deployment configuration
```

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/bakadenir/coreHub.git
cd coreHub

# Install dependencies
npm install

# Set up environment
cp apps/api/.env.example apps/api/.env
# Edit .env with your Supabase + Resend + Midtrans credentials

# Run Supabase locally
npx supabase start

# Start development servers
npm run dev
```

---

## 🔐 Security

- Row-Level Security (RLS) policies on all Supabase tables
- Email OTP verification via Resend
- Admin-only routes with middleware protection
- Full security audit documentation in [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md)

---

## 📝 License

MIT
