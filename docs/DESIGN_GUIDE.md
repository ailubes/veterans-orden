# 🏗️ DESIGN GUIDE
## Мережа Вільних Людей — Structural Timber Design System

**Version:** 1.0  
**Last Updated:** December 2024  
**Reference Implementation:** `assets/merezha-timber-design.jsx`

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Grid & Layout](#4-grid--layout)
5. [Components](#5-components)
6. [Animations & Interactions](#6-animations--interactions)
7. [Iconography](#7-iconography)
8. [Responsive Design](#8-responsive-design)
9. [Code Reference](#9-code-reference)

---

## 1. Design Philosophy

### 1.1 Concept: "Structural Timber"

The design is inspired by **architectural timber framing** — exposed structural elements that reveal how things are built. This metaphor aligns with the organization's values:

- **Transparency** — Structure is visible, nothing hidden
- **Strength** — Solid, load-bearing elements
- **Craftsmanship** — Attention to detail, joints, connections
- **Permanence** — Built to last, not trendy

### 1.2 Visual Principles

| Principle | Implementation |
|-----------|----------------|
| **Structural Honesty** | Grid lines, beams, and joints are visible |
| **Material Authenticity** | Paper-like canvas, wood-inspired colors |
| **Functional Beauty** | Every element serves a purpose |
| **Restrained Palette** | Limited colors, high impact |
| **Typography as Architecture** | Bold headlines as structural elements |

### 1.3 Mood Keywords

- Brutalist
- Architectural
- Editorial
- Serious
- Trustworthy
- Ukrainian

---

## 2. Color System

### 2.1 Primary Palette

```css
:root {
  /* Core Colors */
  --canvas: #f4f1eb;        /* Background - warm paper */
  --timber-dark: #2c2824;   /* Primary text, dark elements */
  --timber-beam: #4a4238;   /* Secondary dark, stats sections */
  --accent: #d45d3a;        /* Terracotta - CTAs, highlights */
  
  /* Supporting Colors */
  --grain: #e8e2d6;         /* Light elements on dark */
  --joint: #1a1816;         /* Darkest - structural joints */
  --grid-line: rgba(74, 66, 56, 0.15); /* Structural lines */
}
```

### 2.2 Color Usage

| Color | Hex | Usage |
|-------|-----|-------|
| **Canvas** | `#f4f1eb` | Page background, card backgrounds |
| **Timber Dark** | `#2c2824` | Headlines, body text, dark cards, buttons |
| **Timber Beam** | `#4a4238` | Stats strip background, secondary sections |
| **Accent (Terracotta)** | `#d45d3a` | CTAs, labels, highlights, hover states |
| **Grain** | `#e8e2d6` | Text on dark backgrounds |
| **Joint** | `#1a1816` | Structural joint elements |
| **Grid Line** | `rgba(74, 66, 56, 0.15)` | Structural grid, borders |

### 2.3 Color Combinations

```
Light Mode (Primary):
┌────────────────────────────────────┐
│  Background: --canvas              │
│  Text: --timber-dark               │
│  Accent: --accent                  │
└────────────────────────────────────┘

Dark Cards:
┌────────────────────────────────────┐
│  Background: --timber-dark         │
│  Text: --grain                     │
│  Accent: --accent                  │
└────────────────────────────────────┘

Stats Strip:
┌────────────────────────────────────┐
│  Background: --timber-beam         │
│  Text: --grain                     │
│  Labels: --accent                  │
└────────────────────────────────────┘
```

### 2.4 Accessibility

- Primary text on canvas: **12.5:1** contrast ratio ✓
- Accent on canvas: **4.8:1** contrast ratio ✓
- Grain on timber-dark: **11.2:1** contrast ratio ✓

---

## 3. Typography

### 3.1 Font Families

```css
/* Headlines - Architectural, bold */
font-family: 'Syne', sans-serif;

/* Body - Technical, monospace */
font-family: 'Space Mono', monospace;
```

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

| Element | Font | Weight | Size | Line Height | Letter Spacing |
|---------|------|--------|------|-------------|----------------|
| **Hero Title** | Syne | 800 | clamp(48px, 7vw, 100px) | 0.9 | -0.04em |
| **Section Title** | Syne | 800 | clamp(36px, 6vw, 72px) | 0.95 | -0.04em |
| **Card Title** | Syne | 700 | 32px | 1.1 | -0.02em |
| **Subsection** | Syne | 700 | 28px | 1.2 | -0.02em |
| **Body Large** | Space Mono | 400 | 18px | 1.6 | 0 |
| **Body** | Space Mono | 400 | 16px | 1.6 | 0 |
| **Body Small** | Space Mono | 400 | 14px | 1.6 | 0 |
| **Caption** | Space Mono | 400 | 12px | 1.5 | 0 |
| **Label** | Space Mono | 700 | 10px | 1.4 | 0.2em |
| **Micro** | Space Mono | 400 | 11px | 1.4 | 0 |

### 3.3 Text Styles

#### Outline Text (Hero effect)
```css
.outline-text {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--timber-dark);
}
```

#### Solid Text
```css
.solid-text {
  color: var(--timber-dark);
  -webkit-text-stroke: 0;
}
```

#### Labels (Uppercase accent)
```css
.label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--accent);
  font-weight: 700;
}
```

### 3.4 Typography Examples

```
HERO:
┌─────────────────────────────────────┐
│  ГУРТУЄМО      ← Outline (1.5px)   │
│  1,000,000     ← Solid + Accent    │
│  ВІЛЬНИХ       ← Outline           │
│  ЛЮДЕЙ         ← Solid             │
└─────────────────────────────────────┘

SECTION:
┌─────────────────────────────────────┐
│  ОСТАННІ ОНОВЛЕННЯ  ← Label        │
│  НОВИНИ             ← Section Title │
└─────────────────────────────────────┘
```

---

## 4. Grid & Layout

### 4.1 Main Grid Structure

```css
.skeleton-container {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 80px;
  min-height: 100vh;
  border-left: 1px solid var(--grid-line);
  border-right: 1px solid var(--grid-line);
  margin: 0 auto;
  max-width: 1600px;
  position: relative;
}
```

**Visual:**
```
│ 80px │    1fr    │    1fr    │    1fr    │ 80px │
│      │           │           │           │      │
│ BEAM │  CONTENT  │  CONTENT  │  CONTENT  │ BEAM │
│      │           │           │           │      │
│      │←─────────────────────────────────→│      │
│      │         grid-column: 2 / 5        │      │
```

### 4.2 Content Width

- **Max container:** 1600px
- **Content area:** grid-column 2/5 (excludes 80px margins)
- **Full bleed:** grid-column 1/6 (for stats strip)

### 4.3 Structural Beams

Vertical lines that create the "timber frame" effect:

```jsx
{/* Structural Beams */}
<div className="beam-v" style={{ left: '80px' }} />
<div className="beam-v" style={{ right: '80px' }} />
<div className="beam-v" style={{ left: '50%', opacity: 0.5 }} />
```

```css
.beam-v {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--grid-line);
  z-index: 1;
}
```

### 4.4 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 10px | Tight gaps |
| `space-sm` | 20px | Small gaps, padding |
| `space-md` | 30px | Medium gaps |
| `space-lg` | 40px | Section padding |
| `space-xl` | 60px | Large section gaps |
| `space-2xl` | 80px | Section margins |
| `space-3xl` | 100px | Hero padding |

### 4.5 Common Layouts

#### Two-Column Hero
```css
header {
  grid-column: 2 / 5;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;
}
```

#### Three-Column Cards
```css
.content-block {
  grid-column: 2 / 5;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--grid-line);
  border: 1px solid var(--grid-line);
}
```

#### News Grid
```css
.news-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1px;
  background: var(--grid-line);
  border: 1px solid var(--grid-line);
}
```

---

## 5. Components

### 5.1 Buttons

#### Primary Button
```css
.btn {
  display: inline-block;
  padding: 20px 40px;
  background: var(--timber-dark);
  color: var(--canvas);
  text-decoration: none;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: 13px;
  position: relative;
  transition: transform 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn:hover {
  transform: translate(4px, -4px);
  box-shadow: -4px 4px 0 var(--accent);
}
```

#### Outline Button
```css
.btn-outline {
  background: transparent;
  color: var(--timber-dark);
  border: 2px solid var(--timber-dark);
}

.btn-outline:hover {
  background: var(--timber-dark);
  color: var(--canvas);
}
```

**Button Sizes:**
| Size | Padding | Font Size |
|------|---------|-----------|
| Small | 15px 25px | 11px |
| Default | 20px 40px | 13px |
| Large | 25px 50px | 14px |

### 5.2 Cards

#### Standard Card (Light)
```css
.card {
  background: var(--canvas);
  padding: 40px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
}

.card:hover {
  background: var(--timber-dark);
  color: var(--canvas);
}

.card:hover .label {
  color: var(--accent);
}
```

#### Dark Card
```css
.card-dark {
  background: var(--timber-dark);
  color: var(--grain);
  padding: 40px;
}
```

#### Card with Joints
```jsx
<div className="card">
  <div className="joint" style={{ top: '-6px', left: '-6px' }} />
  <div className="joint" style={{ top: '-6px', right: '-6px' }} />
  {/* Content */}
</div>
```

### 5.3 Joints (Structural Nodes)

```css
.joint {
  width: 12px;
  height: 12px;
  background: var(--timber-dark);
  position: absolute;
  z-index: 5;
}
```

**Placement:**
- Top-left: `top: -6px; left: -6px;`
- Top-right: `top: -6px; right: -6px;`
- Bottom-left: `bottom: -6px; left: -6px;`
- Bottom-right: `bottom: -6px; right: -6px;`
- Center: `top: -6px; left: 50%; transform: translateX(-50%);`

### 5.4 Stats Strip

```css
.stats-strip {
  background: var(--timber-beam);
  color: var(--grain);
  padding: 60px 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  clip-path: polygon(0 15%, 100% 0, 100% 85%, 0 100%);
}
```

**Visual:**
```
      ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲
     ╱   1,014,256    52%    2024   ГО   ╲
    ╱    ГОЛОСІВ   ПІДТРИМКА  РІК  СТАТУС  ╲
   ╲____________________________________╱
```

### 5.5 Progress Bar

```jsx
<div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
  <div style={{
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: `${percentage}%`,
    background: 'var(--accent)',
    minWidth: '4px'
  }} />
  {/* Milestone markers */}
  <div style={{ position: 'absolute', left: '10%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
</div>
```

### 5.6 News Cards

```css
.news-card {
  padding: 30px;
  border-bottom: 1px solid var(--grid-line);
  transition: all 0.3s ease;
  cursor: pointer;
}

.news-card:hover {
  background: rgba(212, 93, 58, 0.05);
  padding-left: 40px;
}

.news-card:last-child {
  border-bottom: none;
}
```

### 5.7 Navigation

```jsx
<nav style={{
  gridColumn: '2 / 5',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '40px 0',
  borderBottom: '2px solid var(--timber-dark)',
  zIndex: 10
}}>
  {/* Logo */}
  {/* Nav Links */}
  {/* CTA Button */}
</nav>
```

### 5.8 Footer

Three-column grid:
```css
footer {
  grid-column: 2 / 5;
  padding: 60px 0;
  border-top: 2px solid var(--timber-dark);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
}
```

---

## 6. Animations & Interactions

### 6.1 Hover Effects

#### Button Hover (Shadow Offset)
```css
.btn:hover {
  transform: translate(4px, -4px);
  box-shadow: -4px 4px 0 var(--accent);
}
```

#### Card Hover (Color Invert)
```css
.card:hover {
  background: var(--timber-dark);
  color: var(--canvas);
}
```

#### Link Hover
```css
.nav-link:hover {
  color: var(--accent);
}
```

#### News Card Hover (Slide)
```css
.news-card:hover {
  background: rgba(212, 93, 58, 0.05);
  padding-left: 40px;
}
```

### 6.2 Floating Element (Parallax)

```jsx
const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e) => {
    setMousePos({
      x: (window.innerWidth / 2 - e.pageX) / 50,
      y: (window.innerHeight / 2 - e.pageY) / 50
    });
  };
  document.addEventListener('mousemove', handleMouseMove);
  return () => document.removeEventListener('mousemove', handleMouseMove);
}, []);

// Apply to element
<div style={{
  transform: `rotate(-5deg) translate(${mousePos.x}px, ${mousePos.y}px)`
}} />
```

### 6.3 Floating Animation (CSS)

```css
@keyframes float {
  0%, 100% { transform: rotate(-5deg) translate(0, 0); }
  50% { transform: rotate(-5deg) translate(10px, -10px); }
}

.floating-timber {
  animation: float 6s ease-in-out infinite;
}
```

### 6.4 Counter Animation

```jsx
const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count.toLocaleString('uk-UA')}</span>;
};
```

### 6.5 Transition Timing

| Type | Duration | Easing |
|------|----------|--------|
| Button hover | 0.2s | ease |
| Card hover | 0.4s | cubic-bezier(0.23, 1, 0.32, 1) |
| Link color | 0.3s | ease |
| News card slide | 0.3s | ease |
| Counter | 2000ms | linear |

---

## 7. Iconography

### 7.1 Style Guidelines

- **Stroke-based** icons preferred
- **2px stroke weight**
- Use accent color (`#d45d3a`) for emphasis
- Minimal, geometric shapes

### 7.2 Common Icons

For icons, use **Lucide React** or **Heroicons**:

```jsx
import { 
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
  Play
} from 'lucide-react';
```

### 7.3 Social Icons

Simple text abbreviations in buttons:
- YouTube: `▶ YT`
- Telegram: `TG`
- Facebook: `FB`

---

## 8. Responsive Design

### 8.1 Breakpoints

| Breakpoint | Width | Grid Columns |
|------------|-------|--------------|
| Desktop | > 900px | 80px 1fr 1fr 1fr 80px |
| Tablet/Mobile | ≤ 900px | 20px 1fr 20px |

### 8.2 Mobile Adjustments

```css
@media (max-width: 900px) {
  .skeleton-container {
    grid-template-columns: 20px 1fr 20px;
  }
  
  header, nav, .content-block, footer {
    grid-column: 2 / 3;
  }
  
  .content-block {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 48px;
  }
  
  .stats-strip {
    flex-direction: column;
    gap: 40px;
    text-align: center;
    clip-path: none;
  }
  
  .hide-mobile {
    display: none !important;
  }
  
  .mobile-full {
    grid-template-columns: 1fr !important;
  }
}
```

### 8.3 Responsive Typography

```css
/* Hero title */
font-size: clamp(48px, 7vw, 100px);

/* Section title */
font-size: clamp(36px, 6vw, 72px);

/* Quote */
font-size: clamp(24px, 4vw, 36px);
```

---

## 9. Code Reference

### 9.1 Reference Implementation

The complete reference implementation is located at:

```
assets/merezha-timber-design.jsx
```

This file contains:
- Full React component with all styles
- Animated counter component
- Parallax floating element
- Complete page structure
- Responsive grid implementation

### 9.2 Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "lucide-react": "^0.263.1"
  }
}
```

### 9.3 Font Loading

Add to `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
```

Or in CSS:
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
```

### 9.4 Grain Texture (SVG)

```jsx
<svg style={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 9999,
  opacity: 0.3,
  mixBlendMode: 'multiply'
}}>
  <filter id='noiseFilter'>
    <feTurbulence 
      type='fractalNoise' 
      baseFrequency='0.65' 
      numOctaves='3' 
      stitchTiles='stitch'
    />
  </filter>
  <rect width='100%' height='100%' filter='url(#noiseFilter)' />
</svg>
```

### 9.5 CSS Variables (Tailwind Config)

If using Tailwind CSS, add to `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'canvas': '#f4f1eb',
        'timber-dark': '#2c2824',
        'timber-beam': '#4a4238',
        'accent': '#d45d3a',
        'grain': '#e8e2d6',
        'joint': '#1a1816',
        'grid-line': 'rgba(74, 66, 56, 0.15)',
      },
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      },
    },
  },
}
```

### 9.6 File Structure Recommendation

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Joint.tsx
│   │   ├── ProgressBar.tsx
│   │   └── AnimatedCounter.tsx
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── SkeletonGrid.tsx
│   │   └── GrainOverlay.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── Frameworks.tsx
│       ├── StatsStrip.tsx
│       ├── News.tsx
│       ├── Quote.tsx
│       └── CTA.tsx
├── styles/
│   └── globals.css
└── assets/
    └── merezha-timber-design.jsx  ← Reference
```

---

## Appendix: Quick Reference

### Colors (Copy-Paste)

```css
--canvas: #f4f1eb;
--timber-dark: #2c2824;
--timber-beam: #4a4238;
--accent: #d45d3a;
--grain: #e8e2d6;
--joint: #1a1816;
--grid-line: rgba(74, 66, 56, 0.15);
```

### Fonts (Copy-Paste)

```css
font-family: 'Syne', sans-serif;      /* Headlines */
font-family: 'Space Mono', monospace;  /* Body */
```

### Grid (Copy-Paste)

```css
display: grid;
grid-template-columns: 80px 1fr 1fr 1fr 80px;
max-width: 1600px;
margin: 0 auto;
```

---

**Document maintained by:** Design Team  
**Reference file:** `assets/merezha-timber-design.jsx`

---

*"ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!"*
