# 📊 Monitoring & Observability Guide

## 1. Error Tracking (Sentry)

### Setup

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Create new project → Node.js
   - Copy the DSN

2. **Add Environment Variable in Railway**
   ```
   SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
   ```

3. **Sentry is now integrated!**
   - Errors automatically reported
   - Dashboard at sentry.io

---

## 2. Uptime Monitoring

### Free Options

#### UptimeRobot (Recommended)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create free account
3. Add monitors:
   - **API Health**: `https://corehub-api-production.up.railway.app/api/health`
   - **Frontend**: `https://corehub.life`
4. Set check interval: 5 minutes
5. Add alert contacts (email, Slack, Discord)

#### Better Uptime
1. Go to [betteruptime.com](https://betteruptime.com)
2. Free tier includes 10 monitors
3. More features than UptimeRobot

#### Cronitor
1. Go to [cronitor.io](https://cronitor.io)
2. Good for both uptime and cron job monitoring

---

## 3. Application Performance Monitoring (APM)

### Already Included
- **Sentry Performance**: Included in Sentry integration
- Transaction tracing at 10% sample rate

### Additional Options
- **Datadog** (paid)
- **New Relic** (free tier available)
- **Grafana Cloud** (free tier)

---

## 4. Log Management

### Current
- Console logging to Railway logs

### Upgrade Options
- **Logtail** (free 1GB/month)
- **Papertrail** (free tier)
- **Better Stack** (includes logs + uptime)

---

## 5. Status Page

### Free Options
- **Instatus** (free)
- **Atlassian Statuspage** (free for small teams)
- **Better Uptime Status Pages** (included)

### Setup Instatus
1. Go to [instatus.com](https://instatus.com)
2. Create free status page
3. Connect monitors from UptimeRobot
4. Share status page URL with users

---

## Quick Setup Checklist

- [ ] Sign up for Sentry → Add SENTRY_DSN to Railway
- [ ] Sign up for UptimeRobot → Add health check monitors
- [ ] (Optional) Create status page on Instatus
- [ ] Test: Trigger an error and verify it appears in Sentry

---

## Recommended Minimum Setup (Free)

| Service | Purpose | Link |
|---------|---------|------|
| Sentry | Error tracking | sentry.io |
| UptimeRobot | Uptime monitoring | uptimerobot.com |
| Railway Logs | Application logs | railway.app |
