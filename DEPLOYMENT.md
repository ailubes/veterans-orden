# 🚀 Deployment Guide - Орден Ветеранів

This guide covers deploying the Order of Veterans website to Netlify.

## 📋 Prerequisites

- ✅ Node.js 20 or higher
- ✅ npm 10 or higher
- ✅ Netlify account
- ✅ Supabase project configured
- ✅ GitHub repository with latest code

## 🌐 Deployment to Netlify

### Step 1: Connect GitHub Repository

1. Log in to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** as the provider
4. Authorize Netlify to access your GitHub account
5. Select the **`veterans-orden`** repository

### Step 2: Configure Build Settings

Netlify will auto-detect the Next.js framework. Verify these settings:

```
Build command: npm run build
Publish directory: .next
```

### Step 3: Set Environment Variables

Go to **Site settings → Environment variables** and add:

#### Required Variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="Орден Ветеранів"
NEXT_PUBLIC_APP_URL=https://veterans-orden.netlify.app

# Database (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# TinaCMS (Optional - if using TinaCMS Cloud)
NEXT_PUBLIC_TINA_CLIENT_ID=YOUR_CLIENT_ID
TINA_TOKEN=YOUR_TOKEN
NEXT_PUBLIC_TINA_BRANCH=main
```

#### Optional Variables:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=YOUR_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking
SENTRY_DSN=YOUR_SENTRY_DSN

# Email (Resend)
RESEND_API_KEY=YOUR_RESEND_KEY

# VST Bank Payment Integration
VSTBANK_MERCHANT_ID=YOUR_MERCHANT_ID
VSTBANK_API_KEY=YOUR_API_KEY
VSTBANK_SECRET_KEY=YOUR_SECRET_KEY
VSTBANK_CALLBACK_URL=https://veterans-orden.org/api/payments/callback
```

**⚠️ Security Note:** Never commit `.env.local` to git! Use `.env.example` as a template.

### Step 4: Deploy

1. Click **"Deploy site"**
2. Netlify will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Deploy to CDN

**Deployment time:** ~3-5 minutes

### Step 5: Verify Deployment

Once deployed, verify:

- ✅ Homepage loads correctly
- ✅ All 19 static pages accessible
- ✅ Database connection working (check user profile, news)
- ✅ Images and fonts loading
- ✅ Ukrainian language displayed correctly
- ✅ Mobile responsive design

## 🌍 Custom Domain Setup

### Step 1: Add Custom Domain

1. Go to **Site settings → Domain management**
2. Click **"Add custom domain"**
3. Enter: `veterans-orden.org`
4. Click **"Verify"**

### Step 2: Configure DNS

**Option A: Netlify DNS (Recommended)**

1. Go to your domain registrar
2. Update nameservers to Netlify's:
   ```
   dns1.p02.nsone.net
   dns2.p02.nsone.net
   dns3.p02.nsone.net
   dns4.p02.nsone.net
   ```

**Option B: External DNS**

Add these records to your DNS provider:

```
A Record:
  Name: @
  Value: 75.2.60.5

CNAME Record:
  Name: www
  Value: veterans-orden.netlify.app
```

### Step 3: Enable HTTPS

1. Netlify will automatically provision SSL certificate (Let's Encrypt)
2. Enable **"Force HTTPS"** in domain settings
3. Wait 1-2 hours for DNS propagation

### Step 4: Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to production URL:

```bash
NEXT_PUBLIC_APP_URL=https://veterans-orden.org
VSTBANK_CALLBACK_URL=https://veterans-orden.org/api/payments/callback
```

## 🔄 Continuous Deployment

Netlify automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update content"
git push origin main
```

Netlify will:
1. Detect the push
2. Trigger new build
3. Deploy to production
4. **Deploy time:** ~3-5 minutes

## 📊 Deploy Previews

Netlify creates deploy previews for pull requests:

1. Create a feature branch: `git checkout -b feature/new-page`
2. Make changes and push: `git push origin feature/new-page`
3. Create pull request on GitHub
4. Netlify deploys preview at: `https://deploy-preview-XX--veterans-orden.netlify.app`

## 🗄️ Database Migration

After deploying, run database migrations:

```bash
# Option 1: Local migration (with DATABASE_URL from Netlify)
npm run db:push

# Option 2: Run seed script for commanderies
npx tsx scripts/seed-commanderies.ts
```

**Note:** Make sure your local environment has the production `DATABASE_URL`.

## 📝 TinaCMS Setup (Optional)

If using TinaCMS for content editing:

1. Sign up at [TinaCMS Cloud](https://app.tina.io)
2. Create new project
3. Copy Client ID and Token
4. Add to Netlify environment variables:
   ```bash
   NEXT_PUBLIC_TINA_CLIENT_ID=your_client_id
   TINA_TOKEN=your_token
   ```
5. Redeploy site

**Note:** Without TinaCMS credentials, the build will skip TinaCMS generation and use static MDX files directly.

## 🔍 Monitoring & Analytics

### Netlify Analytics

Enable in **Site settings → Analytics**:
- Page views
- Bandwidth usage
- Build minutes

### PostHog (Optional)

1. Sign up at [PostHog](https://posthog.com)
2. Create project
3. Add `NEXT_PUBLIC_POSTHOG_KEY` to Netlify

### Sentry (Optional)

1. Sign up at [Sentry](https://sentry.io)
2. Create project
3. Add `SENTRY_DSN` to Netlify

## 🐛 Troubleshooting

### Build Fails

**Error:** "Module not found"
- Check all imports use correct paths
- Verify `tsconfig.json` paths configuration

**Error:** "Command failed with exit code 1"
- Check build logs for TypeScript errors
- Run `npm run build` locally first

### Runtime Errors

**Error:** "Database connection failed"
- Verify `DATABASE_URL` in environment variables
- Check Supabase project is active

**Error:** "TinaCMS configuration error"
- TinaCMS credentials optional during build
- Site works without TinaCMS, using static MDX

### Performance Issues

- Enable **Asset Optimization** in Netlify settings
- Verify images use Next.js Image component
- Check bundle size: `npm run build` → analyze output

## 🔐 Security Checklist

Before going live:

- ✅ Force HTTPS enabled
- ✅ Security headers configured (in `netlify.toml`)
- ✅ `.env.local` not committed to git
- ✅ Service role key secure (server-side only)
- ✅ API routes protected with authentication
- ✅ CORS configured for API endpoints
- ✅ Rate limiting enabled on sensitive endpoints

## 📞 Support

- **Netlify Docs:** https://docs.netlify.com
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **TinaCMS Docs:** https://tina.io/docs

## 🎉 Post-Deployment Checklist

After successful deployment:

- ✅ Test all pages (19 static + dynamic)
- ✅ Test user registration/login
- ✅ Test news article creation
- ✅ Test event RSVP
- ✅ Test mobile responsive design
- ✅ Verify SEO metadata
- ✅ Test payment integration (if applicable)
- ✅ Monitor error logs for 24 hours
- ✅ Set up backups for database

---

**Deployment Status:** Ready for production ✅

**Estimated Deployment Time:** 15-30 minutes (including DNS propagation)

**Support Contact:** For technical issues, check Netlify logs or GitHub issues.
