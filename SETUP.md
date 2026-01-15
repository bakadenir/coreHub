# CoreHub - Setup Guide

> **Quick setup guide untuk developer baru.** Untuk dokumentasi lengkap, lihat [README.md](./README.md).

---

## 🚀 Quick Start (5 menit)

### Prerequisites
- Node.js v22+
- npm v10+
- Supabase account

### 1. Clone & Install
```bash
git clone https://github.com/bakadenir/coreHub.git
cd coreHub
npm install
```

### 2. Setup Supabase

1. Buat project di [Supabase Dashboard](https://supabase.com/dashboard)
2. Jalankan SQL di **SQL Editor**:
   - `supabase/schema.sql` (database tables)
   - `supabase/rls_policies.sql` (Row Level Security)
3. Copy API keys dari **Settings → API**

### 3. Environment Files

**Backend** - `apps/api/.env`:
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Frontend** - `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development
```bash
# Terminal 1 - Backend
npm run dev:api

# Terminal 2 - Frontend  
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## 🔧 Supabase Configuration

### Dashboard Settings
**Authentication → Providers → Email:**
- ✅ Allow new users to sign up: **ON**
- ✅ Confirm email: **OFF** (untuk development)

### Get API Keys
1. Supabase Dashboard → **Settings → API**
2. Copy:
   - `Project URL` → SUPABASE_URL
   - `anon/public key` → SUPABASE_ANON_KEY
   - `service_role key` → SUPABASE_SERVICE_ROLE_KEY

---

## 📋 Optional Features

### Push Notifications (VAPID)
Generate keys:
```bash
npx web-push generate-vapid-keys
```
Add to `apps/api/.env`:
```env
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:admin@corehub.app
```

### Midtrans Payments (Donations)
Add to `apps/api/.env`:
```env
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=false
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `npx kill-port 3001` atau `Stop-Process -Name "node" -Force` |
| Email not confirmed | Disable "Confirm email" di Supabase, atau confirm manual |
| Module not found | `npm install` dari root directory |
| CORS error | Pastikan `FRONTEND_URL=http://localhost:5173` di backend .env |

---

## 📚 More Documentation

- [README.md](./README.md) - Full project documentation
- [docs/MONITORING.md](./docs/MONITORING.md) - Monitoring & observability
- [supabase/schema.sql](./supabase/schema.sql) - Database schema

---

## 🆘 Need Help?

- 📧 Email: bakadenir@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/bakadenir/coreHub/issues)
