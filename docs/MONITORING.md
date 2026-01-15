# 📊 Monitoring & Observability Guide

Panduan untuk setup monitoring, error tracking, dan observability untuk CoreHub.

---

## 1. Error Tracking (Sentry)

Sentry sudah terintegrasi di backend (`@sentry/node`).

### Setup

1. **Create Sentry Account** di [sentry.io](https://sentry.io)
2. **Create new project** → Node.js
3. **Copy DSN** dan tambahkan ke environment:

```env
# apps/api/.env
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
```

### Features
- ✅ Automatic error capturing
- ✅ Transaction tracing (10% sample rate)
- ✅ Performance monitoring
- ✅ Release tracking

---

## 2. Uptime Monitoring

### Recommended: UptimeRobot (Free)

1. Sign up di [uptimerobot.com](https://uptimerobot.com)
2. Add monitors:

| Monitor | URL | Interval |
|---------|-----|----------|
| API Health | `https://your-api-domain.com/api/health` | 5 min |
| Frontend | `https://your-frontend-domain.com` | 5 min |

3. Setup alerts: Email, Slack, Discord, etc.

### Alternatives
- [Better Uptime](https://betteruptime.com) - Free tier, more features
- [Cronitor](https://cronitor.io) - Good for cron job monitoring

---

## 3. Application Performance Monitoring

### Included with Sentry
- Transaction tracing
- Request duration tracking
- Database query performance

### Additional Options (Paid)
- Datadog
- New Relic (free tier available)
- Grafana Cloud (free tier)

---

## 4. Log Management

### Current Setup
- Console logging to hosting platform logs (Railway, Render, etc.)

### Upgrade Options
| Service | Free Tier | Link |
|---------|-----------|------|
| Logtail | 1GB/month | [logtail.com](https://logtail.com) |
| Papertrail | 100MB/month | [papertrail.com](https://papertrail.com) |
| Better Stack | Included with uptime | [betterstack.com](https://betterstack.com) |

---

## 5. Status Page

Buat public status page untuk users.

### Free Options
- [Instatus](https://instatus.com) - Free, easy setup
- [Atlassian Statuspage](https://www.atlassian.com/software/statuspage) - Free for small teams
- [Better Uptime](https://betteruptime.com) - Includes status pages

### Setup Instatus
1. Sign up di [instatus.com](https://instatus.com)
2. Create status page
3. Connect monitors dari UptimeRobot
4. Share URL: `status.yourapp.com`

---

## 6. Health Check Endpoint

Backend sudah include health check endpoint:

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T12:00:00.000Z"
}
```

---

## Quick Setup Checklist

### Minimum (Free)
- [ ] Sign up Sentry → Add `SENTRY_DSN` to environment
- [ ] Sign up UptimeRobot → Add health check monitors
- [ ] Test: Trigger error, verify appears in Sentry

### Recommended
- [ ] Create status page on Instatus
- [ ] Setup Slack/Discord alerts
- [ ] Configure log aggregation (Logtail)

---

## Summary

| Service | Purpose | Cost |
|---------|---------|------|
| **Sentry** | Error tracking + APM | Free tier |
| **UptimeRobot** | Uptime monitoring | Free |
| **Instatus** | Status page | Free |
| **Platform Logs** | Application logs | Included |

---

## Related

- [README.md](../README.md) - Project documentation
- [SETUP.md](../SETUP.md) - Development setup
