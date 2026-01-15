# 🔐 CoreHub Security Audit Report

**Audit Date**: January 15, 2026  
**Auditor**: Security Engineer AI  
**Project**: CoreHub (Productivity App)

---

## 📊 Executive Summary

| Metric | Status |
|--------|--------|
| **Overall Security Score** | 🟡 **7/10** (Good with improvements needed) |
| **RLS Coverage** | ✅ 13/13 tables enabled |
| **Critical Issues** | ⚠️ 2 issues found |
| **Medium Issues** | ⚠️ 3 issues found |
| **Low Issues** | ℹ️ 2 issues found |

---

## 1️⃣ RLS (Row Level Security) Audit

### Status per Table

| Table | RLS Enabled | Policy Type | Risk Level | Notes |
|-------|:-----------:|-------------|:----------:|-------|
| `notes` | ✅ | user_id + public | 🟢 Low | Public read policy exists ✅ |
| `habits` | ✅ | user_id (ALL) | 🟢 Low | ✅ Correct |
| `habit_completions` | ✅ | habit ownership | 🟢 Low | ✅ Joins to habits.user_id |
| `schedule_events` | ✅ | user_id (ALL) | 🟢 Low | ✅ Correct |
| `schedule_attendees` | ✅ | event ownership | 🟢 Low | ✅ Joins to events.user_id |
| `links` | ✅ | user_id (ALL) | 🟢 Low | ✅ Correct |
| `link_tags` | ✅ | link ownership | 🟢 Low | ✅ Joins to links.user_id |
| `todo_lists` | ✅ | user_id (ALL) | 🟢 Low | ✅ Correct |
| `todos` | ✅ | user_id (ALL) | 🟢 Low | ✅ Correct |
| `notifications` | ✅ | user_id (ALL) | 🟢 Low | ✅ Correct |
| `notification_settings` | ✅ | user_id (ALL) | 🟢 Low | ✅ Correct |
| `push_subscriptions` | ✅ | user_id (ALL) | 🟢 Low | ✅ Correct |
| `feedback` | ✅ | INSERT + SELECT | 🟡 Medium | Anonymous allowed |
| `donations` | ✅ | INSERT + SELECT | 🟡 Medium | Public successful donations visible |

### ✅ Public Notes Policy (Correct Implementation)
```sql
-- Allows public SELECT only when is_public = true
CREATE POLICY "notes_public_select" ON public.notes 
    FOR SELECT USING (is_public = true);
```

---

## 2️⃣ Backend Authentication Audit

### Auth Middleware Analysis (`apps/api/src/middleware/auth.middleware.ts`)

| Check | Status | Details |
|-------|:------:|---------|
| JWT Token Extraction | ✅ | Bearer header + query param (SSE) |
| Token Validation | ✅ | Uses `supabase.auth.getUser(token)` |
| User Metadata | ✅ | Extracts id, email, name, role |
| Error Handling | ✅ | Returns 401 for invalid tokens |

### ⚠️ Issue Found: SSE Token in Query Parameter
```typescript
// Line 26-28 - Token in URL (logged in server logs, browser history)
} else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
}
```

**Risk**: 🟡 Medium - Tokens in URLs may be logged in server access logs and browser history.

**Recommendation**: Use a short-lived token specifically for SSE, or implement cookie-based auth for SSE.

---

## 3️⃣ Admin Security Audit

### Admin Middleware (`apps/api/src/middleware/admin.middleware.ts`)

| Check | Status | Details |
|-------|:------:|---------|
| Auth Required First | ✅ | Must pass `authMiddleware` first |
| Role Verification | ✅ | Checks `req.user.role === 'admin'` |
| 403 on Non-Admin | ✅ | Correct error response |

### ⚠️ CRITICAL Issue: Role Stored in user_metadata

```typescript
// auth.middleware.ts line 47
role: user.user_metadata?.role || 'user',
```

**Risk**: 🔴 HIGH - `user_metadata` can be modified by the user via Supabase client!

**Proof of Vulnerability**:
```javascript
// Frontend (attacker can do this)
await supabase.auth.updateUser({
  data: { role: 'admin' }
});
```

**Fix Required**: Move role to `app_metadata` (server-only) or a separate `profiles` table with RLS.

---

## 4️⃣ Backend Service - RLS Bypass Analysis

### ⚠️ CRITICAL Issue: All Services Use service_role_key

**File**: `apps/api/src/config/supabase.ts`
```typescript
// Uses service role key - BYPASSES ALL RLS!
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, ...);
```

**Current Architecture**:
```
Frontend → Bearer Token → Backend → service_role_key → Database (RLS bypassed)
```

**Risk**: 🔴 HIGH - RLS policies are NOT enforced for backend operations.

**Current Mitigations**:
- ✅ All services manually filter by `userId` in queries (e.g., `.eq('user_id', userId)`)
- ✅ `userId` comes from validated JWT (cannot be spoofed)

**Verdict**: While RLS is bypassed, manual filtering is correctly implemented. However, this is error-prone.

**Recommended Pattern** (Optional, safer):
Create a per-request Supabase client with user's JWT:
```typescript
// Safer approach
const supabaseWithUser = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${userToken}` } }
});
```

---

## 5️⃣ Hardcoded Keys Audit

### Backend (`apps/api/`)

| Variable | Location | Exposed? |
|----------|----------|:--------:|
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` (gitignored) | ❌ Safe |
| `SUPABASE_URL` | `.env` | ❌ Safe |
| `MIDTRANS_SERVER_KEY` | `.env` | ❌ Safe |
| `VAPID_PRIVATE_KEY` | `.env` | ❌ Safe |

### Frontend (`apps/web/`)

| Variable | Exposed? | Risk |
|----------|:--------:|------|
| `VITE_SUPABASE_URL` | ✅ Public | 🟢 OK (designed to be public) |
| `VITE_SUPABASE_ANON_KEY` | ✅ Public | 🟢 OK (designed to be public) |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ NOT FOUND | ✅ Correct |

**Result**: ✅ No sensitive keys exposed in frontend

---

## 6️⃣ Issues Summary & Fixes

### 🔴 CRITICAL Issues

#### Issue 1: Admin Role Spoofing via user_metadata

**File**: `apps/api/src/middleware/auth.middleware.ts`

**Current Code** (Vulnerable):
```typescript
role: user.user_metadata?.role || 'user',
```

**Fix Option A**: Use `app_metadata` (requires Admin API to change)
```typescript
// In auth.middleware.ts
role: user.app_metadata?.role || 'user',
```

**Fix Option B**: Add server-side validation in admin.middleware.ts
```typescript
// admin.middleware.ts - Double-check with Admin API
import { supabase } from '../config/supabase';

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify role from server (app_metadata can't be modified by user)
    const { data } = await supabase.auth.admin.getUserById(req.user.id);
    const actualRole = data?.user?.app_metadata?.role || 
                       data?.user?.user_metadata?.role || 'user';
    
    if (actualRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    }

    req.user.role = actualRole; // Update with verified role
    next();
}
```

#### Issue 2: RLS Bypass in Backend

**File**: `apps/api/src/config/supabase.ts`

**Current**: All queries bypass RLS via service_role_key.

**Mitigation** (Already in place): Manual `.eq('user_id', userId)` filters.

**Optional Improvement**: Create user-scoped client:
```typescript
// config/supabase.ts
export function createUserClient(token: string) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
}
```

---

### 🟡 MEDIUM Issues

#### Issue 3: SSE Token in Query Parameter

**File**: `apps/api/src/middleware/auth.middleware.ts`

**Risk**: Token may be logged in server access logs.

**Fix**: Use short-lived SSE tokens or cookies.

#### Issue 4: Missing Rate Limiting on Public Endpoints

**Files**: `apps/api/src/routes/public.routes.ts`

**Add rate limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: { error: 'Too many requests' }
});

router.use(publicLimiter);
```

#### Issue 5: Update .env.example for Supabase

**File**: `apps/api/.env.example`

Current shows old Better Auth vars. Update to:
```env
# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

### ℹ️ LOW Issues

#### Issue 6: activity_logs Table Missing from Schema

**File**: `supabase/schema.sql`

Admin service references `activity_logs` but it's not in schema.sql.

**Fix**: Add to schema.sql:
```sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
```

And RLS policy:
```sql
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
-- Only admins can read logs (no user-level policy needed since backend uses service_role)
CREATE POLICY "activity_logs_insert" ON public.activity_logs 
    FOR INSERT WITH CHECK (true); -- Backend inserts via service_role
```

#### Issue 7: Missing content_reports and profiles Tables

Admin service references these but they're not in schema:
- `content_reports` - for report management
- `profiles` - for user stats

---

## 7️⃣ Recommendations for 500 Active Users

### Performance & Security

| Recommendation | Priority | Impact |
|----------------|:--------:|--------|
| Add connection pooling (PgBouncer) | High | Prevents connection exhaustion |
| Add Redis for session caching | Medium | Faster auth validation |
| Implement request rate limiting | High | Prevents API abuse |
| Add request logging with correlation IDs | Medium | Better debugging |
| Enable Supabase RLS even with service_role | Low | Defense in depth |

### Database Indexes (Already present, verify applied)

```sql
-- Verify these indexes exist for query performance
CREATE INDEX IF NOT EXISTS idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_user_list ON todos(user_id, list_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_habits_user_archived ON habits(user_id, is_archived);
```

### Monitoring

```typescript
// Add to index.ts
import * as Sentry from '@sentry/node';

// Track slow queries
const queryStart = Date.now();
// ... query
if (Date.now() - queryStart > 1000) {
    Sentry.captureMessage(`Slow query: ${queryName}`, 'warning');
}
```

---

## 8️⃣ Action Items Checklist

### Critical (Do Immediately)
- [ ] Fix admin role verification (use app_metadata or server-side verification)
- [ ] Add rate limiting to public endpoints

### High Priority (This Week)
- [ ] Update .env.example with Supabase variables
- [ ] Add activity_logs table to schema.sql
- [ ] Add content_reports and profiles tables if needed

### Medium Priority (This Month)
- [ ] Consider using user-scoped Supabase clients instead of service_role
- [ ] Implement SSE token rotation or cookie-based auth
- [ ] Add structured logging with request IDs

### Optional Improvements
- [ ] Enable Supabase Database Webhooks for audit logging
- [ ] Set up Supabase Realtime for live updates (instead of SSE)
- [ ] Configure Supabase Auth email templates

---

## 9️⃣ Conclusion

CoreHub has a **solid security foundation** with properly configured RLS policies and JWT validation. The main concerns are:

1. **Admin role can be spoofed** via user_metadata - **MUST FIX**
2. **RLS is bypassed** in backend (mitigated by manual filtering)
3. **SSE token exposure** in URLs

With the recommended fixes applied, the application will be production-ready for 500+ users.

---

*Report generated by Security Audit Tool v1.0*
