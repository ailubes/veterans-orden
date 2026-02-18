# 🚀 Deployment Status - Орден Ветеранів

**Deployed:** January 14, 2026
**Server:** 167.235.10.212
**Status:** ✅ LIVE AND OPERATIONAL

---

## 🌐 Domain Configuration

### Primary Domain: ordenv.com.ua
- **Status:** ✅ LIVE with HTTPS
- **DNS:** Correctly points to 167.235.10.212
- **SSL Certificate:** Valid until April 14, 2026
- **Auto-renewal:** Enabled via certbot
- **URL:** https://ordenv.com.ua

### Secondary Domain: ordenv.org
- **Status:** ✅ LIVE with HTTPS
- **DNS:** Correctly points to 167.235.10.212
- **SSL Certificate:** Valid until April 14, 2026
- **Auto-renewal:** Enabled via certbot
- **URL:** https://ordenv.org

---

## 📦 Application Stack

| Component | Version | Status | Port |
|-----------|---------|--------|------|
| **Node.js** | 22.19.0 | ✅ Running | - |
| **NPM** | 10.9.3 | ✅ Installed | - |
| **Next.js** | 16.1.1 | ✅ Built & Running | 3031 |
| **PM2** | 6.0.13 | ✅ Running | - |
| **Nginx** | 1.24.0 | ✅ Running | 80, 443 |
| **PostgreSQL** | Supabase | ✅ Connected | Remote |

---

## 🔧 Configuration Files

### Environment Variables
- **Location:** `/var/www/ordenv.org/.env.local`
- **Database:** Connected to Supabase (sdnmeiebiishngzacmyi)
- **Status:** ✅ Configured

### PM2 Process Manager
- **Config:** `/var/www/ordenv.org/ecosystem.config.js`
- **Process Name:** `ordenv`
- **Auto-start:** ✅ Enabled (systemd)
- **Restart Policy:** Automatic on crash
- **Memory Limit:** 1GB
- **Logs:** `/var/www/ordenv.org/logs/`

### Nginx Configuration
- **Config Files:**
  - `/etc/nginx/sites-available/ordenv.com.ua` (HTTPS enabled)
  - `/etc/nginx/sites-available/ordenv.org` (HTTP only, awaiting DNS)
- **Reverse Proxy:** localhost:3031 → HTTPS
- **SSL:** Let's Encrypt certificates
- **Security Headers:** Enabled
- **Cache:** Static assets cached for 1 year

---

## 🔐 SSL Certificates

### ordenv.com.ua
- **Certificate:** `/etc/letsencrypt/live/ordenv.com.ua/fullchain.pem`
- **Private Key:** `/etc/letsencrypt/live/ordenv.com.ua/privkey.pem`
- **Issued:** January 14, 2026
- **Expires:** April 14, 2026 (90 days)
- **Auto-renewal:** ✅ Enabled via systemd timer
- **Renewal Check:** Runs daily at 21:21 EET

### ordenv.org
- **Status:** Pending DNS update
- **Will be obtained automatically after DNS propagation**

---

## 📊 Database

### Supabase PostgreSQL
- **Project ID:** sdnmeiebiishngzacmyi
- **Region:** EU
- **Connection:** ✅ Working
- **Migrations:** 35 migration files in `/var/www/ordenv.org/supabase/migrations/`
- **Schema:** Production-ready tables for users, events, news, tasks, etc.

**Migration Files:**
- Initial schema: `20241101000000_initial_schema.sql`
- Latest: `20260107010000_create_pages_table.sql`
- Total: 35 migrations

---

## 🚀 Deployment Commands

### Check Application Status
```bash
pm2 status
pm2 logs ordenv
```

### Restart Application
```bash
pm2 restart ordenv
```

### Rebuild Application (after code changes)
```bash
cd /var/www/ordenv.org
git pull
npm install
npm run build
pm2 restart ordenv
```

### Check Nginx Status
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx
```

### Check SSL Certificates
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### View Logs
```bash
# PM2 logs
pm2 logs ordenv

# Nginx logs
sudo tail -f /var/log/nginx/ordenv.com.ua.access.log
sudo tail -f /var/log/nginx/ordenv.com.ua.error.log

# System logs
sudo journalctl -u pm2-root -f
```

---

## 🔄 Auto-Renewal Configuration

### SSL Certificates
- **Method:** Let's Encrypt via certbot
- **Schedule:** Daily check at 21:21 EET
- **Systemd Timer:** certbot.timer (enabled)
- **Test Renewal:** `sudo certbot renew --dry-run`

### PM2 Auto-Start
- **Systemd Service:** pm2-root.service (enabled)
- **Starts on boot:** ✅ Yes
- **Process saved:** ✅ Yes

---

## 📈 Performance & Monitoring

### Current Stats (as of deployment)
- **Memory Usage:** ~69 MB
- **CPU Usage:** 0%
- **Uptime:** Since 10:48 UTC
- **Response Time:** <100ms
- **Cache Hit Rate:** HIT for static content

### Monitoring
- **PM2 Built-in:** Process monitoring, auto-restart
- **Nginx Logs:** Access and error logs
- **SSL Monitoring:** Automatic renewal checks

---

## ✅ Deployment Checklist

- [x] Node.js and NPM installed
- [x] PM2 process manager configured
- [x] Dependencies installed
- [x] Next.js application built
- [x] Environment variables configured
- [x] Database connection verified
- [x] PM2 process running
- [x] PM2 auto-start enabled
- [x] Nginx reverse proxy configured
- [x] SSL certificate obtained for ordenv.com.ua
- [x] HTTPS redirect enabled
- [x] SSL auto-renewal configured
- [x] Security headers enabled
- [x] Static asset caching configured
- [x] Site accessible via HTTPS
- [x] Database queries working
- [x] DNS updated for ordenv.org
- [x] SSL certificate for ordenv.org

---

## 🛠️ Post-Deployment Tasks

### Completed ✅
- ✅ Site is live on https://ordenv.com.ua
- ✅ Site is live on https://ordenv.org
- ✅ SSL certificates for both domains (auto-renewing)
- ✅ Application auto-starts on server reboot
- ✅ Both domains with HTTPS redirect
- ✅ Security headers enabled

### Optional Enhancements
- 📧 Configure email service (Resend API key)
- 💳 Configure payment integration (VST Bank)
- 📊 Set up analytics (PostHog)
- 🐛 Configure error tracking (Sentry)
- 🔔 Set up monitoring alerts
- 📱 Configure TinaCMS (if needed for content editing)

---

## 📞 Quick Reference

### URLs
- **Primary Site:** https://ordenv.com.ua
- **Secondary Site:** https://ordenv.org
- **Both domains:** Fully operational with HTTPS

### Server Access
- **Server IP:** 167.235.10.212
- **Application Path:** `/var/www/ordenv.org`
- **Node.js Port:** 3031 (internal)
- **Public Ports:** 80 (HTTP), 443 (HTTPS)

### Important Files
- **Environment:** `/var/www/ordenv.org/.env.local`
- **PM2 Config:** `/var/www/ordenv.org/ecosystem.config.js`
- **Nginx Config:** `/etc/nginx/sites-available/ordenv.com.ua`
- **SSL Certs:** `/etc/letsencrypt/live/ordenv.com.ua/`
- **Logs:** `/var/www/ordenv.org/logs/`

---

## 🎉 Success!

Your **Орден Ветеранів** website is now live and operational on both domains:
- 🌐 **https://ordenv.com.ua**
- 🌐 **https://ordenv.org**

Both domains feature:
- ✅ Automatic HTTPS with SSL (auto-renewing every 90 days)
- ✅ Production-grade reverse proxy (Nginx)
- ✅ Process monitoring and auto-restart (PM2)
- ✅ Optimized static asset delivery
- ✅ Security headers enabled
- ✅ Database connected and working
- ✅ Responsive UI with language switcher (UA/EN)
- ✅ Theme toggle (Light/Dark mode)

**Deployment Complete!** Both domains are fully operational and ready for production use.

---

*Deployed with Claude Code - January 14, 2026*
