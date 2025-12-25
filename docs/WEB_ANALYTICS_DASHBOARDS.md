# Web Analytics Dashboards - PostHog Setup Guide

## Overview

This guide shows you how to set up PostHog dashboards to track traditional web analytics metrics, effectively replacing Google Analytics.

## Quick Start

1. Login to [PostHog Dashboard](https://app.posthog.com)
2. Navigate to **Insights** → **New Insight**
3. Follow the dashboard configurations below

---

## 📊 Dashboard 1: Traffic Overview

### Insight 1: Total Page Views (Trend)

**Type:** Trend
**Event:** `$pageview`
**Visualization:** Line chart
**Breakdown:** None
**Filters:** None
**Date Range:** Last 30 days

**What it shows:** Overall traffic trends over time

---

### Insight 2: Unique Visitors (Trend)

**Type:** Trend
**Event:** `$pageview`
**Visualization:** Line chart
**Formula:** Unique users
**Date Range:** Last 30 days

**What it shows:** Number of unique visitors per day

---

### Insight 3: Traffic Sources (Breakdown)

**Type:** Trend
**Event:** `$pageview`
**Visualization:** Pie chart or Table
**Breakdown by:** `utm_source`
**Date Range:** Last 30 days

**What it shows:** Where your traffic is coming from (Google, Facebook, direct, etc.)

**PostHog Query:**
```
Events: $pageview
Breakdown: utm_source
Visualization: Pie chart
```

---

### Insight 4: Traffic by Referrer Domain

**Type:** Trend
**Event:** `$pageview`
**Visualization:** Table
**Breakdown by:** `referrer_domain`
**Date Range:** Last 30 days

**What it shows:** Which external sites send you traffic

---

### Insight 5: Sessions Started

**Type:** Trend
**Event:** `session_started`
**Visualization:** Line chart
**Date Range:** Last 30 days

**What it shows:** New user sessions over time

---

## 📈 Dashboard 2: User Behavior

### Insight 1: Average Time on Page

**Type:** Trend
**Event:** `time_on_page`
**Property:** `time_seconds`
**Aggregation:** Average
**Visualization:** Line chart
**Date Range:** Last 30 days

**What it shows:** How long users spend on pages on average

**PostHog Query:**
```
Events: time_on_page
Math: Average of time_seconds
Visualization: Line chart
```

---

### Insight 2: Time on Page by URL

**Type:** Table
**Event:** `time_on_page`
**Property:** `time_seconds`
**Aggregation:** Average
**Breakdown by:** `page`
**Sort:** Descending by avg time
**Limit:** Top 20 pages

**What it shows:** Which pages keep users engaged longest

---

### Insight 3: Scroll Depth Distribution

**Type:** Bar chart
**Event:** `scroll_depth_milestone`
**Breakdown by:** `depth`
**Date Range:** Last 7 days

**What it shows:** How far down the page users scroll (25%, 50%, 75%, 100%)

---

### Insight 4: Exit Intent Rate

**Type:** Trend
**Event:** `exit_intent`
**Visualization:** Line chart
**Date Range:** Last 30 days

**What it shows:** When users attempt to leave (cursor moves to top of viewport)

---

### Insight 5: Bounce Rate (Custom Formula)

**Type:** Formula insight
**Events:**
- A: `$pageview`
- B: `session_started` where only 1 pageview in session

**Formula:** `(B / A) * 100`
**Visualization:** Number with trend

**What it shows:** % of sessions with only 1 page view

---

## 🎯 Dashboard 3: Campaigns & UTM Tracking

### Insight 1: Campaign Performance

**Type:** Table
**Event:** `session_started`
**Breakdown by:** `utm_campaign`
**Show columns:**
- Campaign name
- Sessions
- Conversions (onboarding_completed)
- Conversion rate

**What it shows:** Which marketing campaigns drive the most conversions

---

### Insight 2: Traffic by Medium

**Type:** Pie chart
**Event:** `$pageview`
**Breakdown by:** `utm_medium`
**Date Range:** Last 30 days

**What it shows:** Distribution across channels (social, email, paid, organic)

---

### Insight 3: UTM Source + Medium Combo

**Type:** Table
**Event:** `session_started`
**Breakdown by:** `utm_source`, `utm_medium`
**Columns:** Sessions, Avg time on site
**Sort:** Descending by sessions

**What it shows:** Best performing source/medium combinations

---

## 📱 Dashboard 4: Device & Technical

### Insight 1: Viewport Sizes

**Type:** Table
**Event:** `$pageview`
**Breakdown by:** `viewport_width`, `viewport_height`
**Show:** Count
**Limit:** Top 10

**What it shows:** Most common screen resolutions

---

### Insight 2: Mobile vs Desktop

**Type:** Pie chart
**Event:** `$pageview`
**Breakdown by:** Formula:
- Mobile: `viewport_width < 768`
- Desktop: `viewport_width >= 768`

**What it shows:** Mobile vs desktop traffic split

---

### Insight 3: Page Load Performance (Future)

When you implement performance tracking:

**Type:** Trend
**Event:** `page_load`
**Property:** `load_time_ms`
**Aggregation:** Percentile (P75)
**Visualization:** Line chart

**What it shows:** 75th percentile page load time

---

## 🔍 Dashboard 5: Content Performance

### Insight 1: Top Pages by Views

**Type:** Table
**Event:** `$pageview`
**Breakdown by:** `$current_url`
**Show:** Count
**Sort:** Descending
**Limit:** Top 20

**What it shows:** Most visited pages

---

### Insight 2: External Links Clicked

**Type:** Table
**Event:** `external_link_clicked`
**Breakdown by:** `url`
**Show:** Count, Unique users
**Date Range:** Last 30 days

**What it shows:** Which external links users click most

---

### Insight 3: File Downloads

**Type:** Table
**Event:** `file_downloaded`
**Breakdown by:** `file_name`, `file_type`
**Show:** Count
**Date Range:** Last 30 days

**What it shows:** Most popular downloads

---

### Insight 4: 404 Errors

**Type:** Table
**Event:** `404_error`
**Breakdown by:** `attempted_path`
**Show:** Count, Referrer
**Sort:** Descending
**Limit:** Top 20

**What it shows:** Broken links and missing pages

---

## 📞 Dashboard 6: Conversions & CTAs

### Insight 1: CTA Click-Through Rate

**Type:** Funnel
**Steps:**
1. Page view
2. `cta_clicked` (filter by cta_location)

**Breakdown by:** `cta_name`

**What it shows:** Which CTAs convert best

---

### Insight 2: Form Performance

**Type:** Funnel
**Steps:**
1. `form_started`
2. `form_submitted` with success=true

**Breakdown by:** `form_name`

**What it shows:** Form completion rates

---

### Insight 3: Form Abandonment Analysis

**Type:** Table
**Event:** `form_abandoned`
**Breakdown by:** `form_name`
**Show:**
- Count
- Avg completion_rate
**Sort:** By count descending

**What it shows:** Which forms have highest abandonment

---

## 🎬 Dashboard 7: Media Engagement

### Insight 1: Videos Played

**Type:** Table
**Event:** `video_played`
**Breakdown by:** `video_title`
**Show:** Count, Unique users
**Date Range:** Last 30 days

**What it shows:** Most watched videos

---

### Insight 2: Video Completion Rate

**Type:** Funnel
**Steps:**
1. `video_played`
2. `video_completed`

**Breakdown by:** `video_title`

**What it shows:** What % of viewers finish videos

---

## 🔄 Setting Up Real-Time Dashboard

Create a dashboard with **5-minute auto-refresh**:

1. **Active Users Right Now** (Last 5 minutes)
   - Event: `$pageview`
   - Unique users
   - Date range: Last 5 minutes

2. **Pages Being Viewed**
   - Event: `$pageview`
   - Breakdown: `$current_url`
   - Date range: Last 5 minutes

3. **Live Events Stream**
   - Use PostHog's "Live Events" feature
   - Filter by `$pageview`, `session_started`, etc.

---

## 📋 Recommended Dashboard Layout

### Main Traffic Dashboard
1. Total pageviews (big number)
2. Unique visitors (big number)
3. Pageview trend (line chart)
4. Traffic sources (pie chart)
5. Top pages (table)
6. Referrer domains (table)

### User Engagement Dashboard
1. Avg time on page (big number)
2. Scroll depth distribution (bar chart)
3. Time on page by URL (table)
4. Bounce rate (big number)
5. Exit intent events (trend)

### Campaign Dashboard
1. Campaign performance (table)
2. UTM source breakdown (pie)
3. UTM medium breakdown (pie)
4. Source + medium combos (table)

---

## 🎨 Creating a Dashboard

### Step-by-Step:

1. **Go to Dashboards** → **New Dashboard**
2. **Name it:** "Traffic Overview" (or any name from above)
3. **Click "Add Insight"**
4. **Configure each insight** as described above
5. **Save and arrange** tiles on the dashboard
6. **Set auto-refresh** (optional): Dashboard settings → Auto-refresh every 5 min

### Sharing Dashboards:

- **Internal:** Share link with team members
- **Public:** Make dashboard public (Settings → Make public)
- **Export:** Download as PDF or schedule email reports

---

## 📧 Setting Up Automated Reports

1. Go to **Dashboard** → **Settings**
2. Click **Subscribe**
3. Configure:
   - Email recipients
   - Frequency (daily, weekly, monthly)
   - Time to send
4. Save

You'll receive dashboard snapshots via email automatically.

---

## 🔔 Setting Up Alerts

Create alerts for important metrics:

### Example: Traffic Drop Alert

1. Go to **Insights** → Create "Total Pageviews" trend
2. Click **Alerts** → **New Alert**
3. Configure:
   - **Metric:** Pageviews count
   - **Condition:** Decreases by more than 30% compared to previous period
   - **Check frequency:** Every hour
   - **Notification:** Email or Slack

### Example: High 404 Rate Alert

1. Create "404 Errors" trend insight
2. Set alert:
   - **Condition:** Count exceeds 50 per hour
   - **Notification:** Slack channel #engineering

---

## 🆚 PostHog vs Google Analytics Comparison

| Metric | Google Analytics | PostHog Equivalent |
|--------|------------------|-------------------|
| Pageviews | Pageviews | `$pageview` event |
| Users | Users | Unique users on `$pageview` |
| Sessions | Sessions | `session_started` event |
| Bounce Rate | Bounce Rate | Custom formula (sessions with 1 pageview) |
| Avg Session Duration | Avg Session Duration | Sum of `time_on_page` events |
| Traffic Source | Source/Medium | `utm_source` / `utm_medium` |
| Conversion Rate | Goals | Funnels (e.g., signup → payment) |
| Real-time | Real-time Overview | Live events + 5-min dashboards |

---

## 🧪 Testing Your Dashboards

1. **Open your site** in a browser
2. **Navigate a few pages** (generates `$pageview` events)
3. **Scroll down** (generates scroll_depth milestones)
4. **Wait 10+ seconds** on a page (generates time_on_page)
5. **Click an external link** (generates external_link_clicked)
6. **Go to PostHog** → Events tab
7. **Verify events appear** (5-10 second delay)
8. **Check dashboards** → Should populate within a minute

---

## 🎯 Key Metrics to Monitor Weekly

Create a **Weekly Review Dashboard** with these KPIs:

1. **Total visitors** (trend vs last week)
2. **New vs returning visitors**
3. **Top 10 pages by views**
4. **Avg time on site**
5. **Bounce rate**
6. **Top 5 traffic sources**
7. **Campaign conversions**
8. **Form completion rates**

Schedule this as a **Monday morning email report** to the team.

---

## 🚀 Advanced: Custom SQL Insights (PostHog Cloud)

For complex queries, use PostHog's SQL editor:

### Example: Pages with >30s avg time

```sql
SELECT
  properties.page AS page,
  AVG(properties.time_seconds) AS avg_time,
  COUNT(*) AS views
FROM events
WHERE event = 'time_on_page'
  AND timestamp >= NOW() - INTERVAL 30 DAY
GROUP BY page
HAVING avg_time > 30
ORDER BY avg_time DESC
LIMIT 20
```

---

## 📚 Next Steps

1. **Create 3 core dashboards:**
   - Traffic Overview
   - User Behavior
   - Campaigns

2. **Set up 2 alerts:**
   - Traffic drop >30%
   - 404 errors >50/hour

3. **Schedule weekly report:**
   - Email every Monday at 9am
   - Include Traffic + Campaigns dashboards

4. **Train your team:**
   - Share dashboard links
   - Document custom events
   - Establish naming conventions

---

**Your PostHog setup now tracks all the metrics you'd get from Google Analytics, plus deeper product analytics!** 🎉
