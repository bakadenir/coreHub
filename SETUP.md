# CoreHub - Project Setup Guide

## 🎯 Project Status: Supabase Migration Complete

The project has been migrated from **Better Auth + Drizzle ORM** to **Supabase Cloud**.

---

## 📋 Quick Start

### Prerequisites
- Node.js v22+
- npm v10+
- Supabase account (project already created)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd coreHub
npm install
```

### 2. Environment Setup

**Backend (`apps/api/.env`):**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase (REQUIRED)
SUPABASE_URL=https://cicskrlvnuvsgvzphwod.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Optional - Midtrans (for donations)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Optional - Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@corehub.app
```

**Frontend (`apps/web/.env`):**
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://cicskrlvnuvsgvzphwod.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Run Development Servers
```bash
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

---

## 🔐 Supabase Configuration

### Dashboard Settings (Authentication → Providers → Email)
- ✅ Allow new users to sign up: **ON**
- ✅ Confirm email: **OFF** (for development)
- ✅ Email provider: **Enabled**

### Get API Keys
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

---

## 📁 Project Structure

```
coreHub/
├── apps/
│   ├── api/           # Express.js Backend
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── supabase.ts    # Supabase admin client
│   │   │   │   └── env.ts         # Environment validation
│   │   │   ├── middleware/
│   │   │   │   └── auth.middleware.ts  # JWT verification
│   │   │   ├── services/          # All 11 services (Supabase)
│   │   │   └── routes/            # API routes
│   │   └── .env
│   └── web/           # React + Vite Frontend
│       ├── src/
│       │   ├── lib/
│       │   │   ├── supabaseClient.ts  # Supabase client
│       │   │   ├── auth.ts            # Auth helpers
│       │   │   └── api.ts             # API client with Bearer token
│       │   ├── context/
│       │   │   └── AuthContext.tsx    # Supabase session management
│       │   └── pages/
│       │       ├── Login.tsx
│       │       └── Register.tsx
│       └── .env
└── package.json       # Monorepo root
```

---

## ✅ What's Done

- [x] Supabase project created
- [x] Backend migrated to Supabase client
- [x] All 11 services rewritten (habits, notes, links, schedules, etc.)
- [x] Auth middleware uses JWT verification
- [x] Frontend uses Supabase session
- [x] API calls include Bearer token automatically
- [x] Login/Register pages updated

---

## ⚠️ Known Issues & TODOs

### Current Issues
1. **Email not confirmed error**: Users created before disabling "Confirm email" still need manual confirmation in Supabase Dashboard

### To Fix
- Delete test users from Supabase Dashboard and re-register
- OR manually confirm users via Dashboard → Authentication → Users → ⋮ → Confirm email

### Future TODOs
- [ ] Test all CRUD operations
- [ ] Configure Resend for production emails
- [ ] Setup RLS policies in Supabase (optional)
- [ ] Deploy to Netlify (frontend) + Railway (backend)

---

## 🌐 Target Deployment

| Component | Service | Status |
|-----------|---------|--------|
| Database + Auth | Supabase Cloud | ✅ Ready |
| Frontend | Netlify | 🔲 Not deployed |
| Backend | Railway | 🔲 Not deployed |
| Domain | Hostinger | 🔲 Not configured |
| Email (OTP) | Resend | 🔲 Not configured |

---

## 🔑 Important Notes

1. **Login only works with email** (username lookup removed)
2. **Session is JWT-based** (not cookies)
3. **User metadata** stored in Supabase `user_metadata`, not separate table
4. **Drizzle ORM removed** - using Supabase client directly

---

## 📞 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/habits` | Get user habits |
| `GET /api/notes` | Get user notes |
| `GET /api/links` | Get user links |
| `GET /api/schedules` | Get user schedules |
| `GET /api/search?q=` | Global search |

All protected endpoints require `Authorization: Bearer <token>` header.

---

## 🆘 Troubleshooting

### "Email not confirmed" on login
- Delete user from Supabase Dashboard
- Re-register (Confirm email setting should be OFF)

### Port already in use
```bash
# Kill all node processes
Stop-Process -Name "node" -Force  # Windows
killall node                       # Mac/Linux
```

### Module not found errors
```bash
npm install  # from root directory
```
