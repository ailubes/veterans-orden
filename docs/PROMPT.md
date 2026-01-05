Here is a comprehensive design system documentation and a strategic guide for porting this prototype into a production-ready Next.js application.

---

# Part 1: Design System & Visual Language
**Project Code:** *Order of Veterans (Industrial/Brutalist)*

## 1. Design Philosophy
The visual language is built on the concept of **"Reinforced Structure."** It mimics construction materials to convey durability, unyielding strength, and institutional weight.
*   **Keywords:** Concrete, Rebar, Bronze, Tension, Monolith, Industrial.
*   **Atmosphere:** Dark, heavy, serious, yet sophisticated.

## 2. Color Palette (The "Foundry" System)
The palette uses deep industrial greys contrasted with a metallic bronze accent.

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `Background` | `#0f1011` | Main page background (Void) |
| `Panel Dark` | `#141618` | Darker surface gradients |
| `Panel Light` | `#1a1d20` | Lighter surface gradients |
| `Text Primary` | `#e7e7e7` | Headings, primary body text |
| `Text Muted` | `#8b8f96` | Subtitles, descriptions |
| **`Accent Bronze`** | **`#b5793a`** | **Primary actions, active states, highlights** |
| `Bronze Deep` | `#8c5a25` | Bronze shadows/depth |
| `Steel` | `#7d7d7d` | Structural lines, inactive borders |
| `Border Line` | `rgba(255,255,255,0.1)` | Subtle separation lines |

## 3. Typography
*   **Primary Font:** `Inter` (Weights: 400, 700, 900)
    *   Used for: Headings (Uppercased), Body text.
    *   *Note:* Headings are extremely tight (`line-height: 0.86`, `letter-spacing: -0.05em`).
*   **Technical Font:** `IBM Plex Mono` (Weights: 400, 600)
    *   Used for: "Kickers" (`// WHO WE ARE`), Tags, Stats labels, Footer.
    *   *Style:* Uppercase, wide spacing (`letter-spacing: 0.22em`), small size.

## 4. Textures & Effects
*   **Concrete Noise:** A global SVG noise filter (`feTurbulence`) applied via `opacity: 0.045` over the entire body to remove the "digital smoothness" of flat colors.
*   **Rebar Pattern:** A repeating linear gradient striping used on the vertical rail and card overlays to mimic reinforced steel bars.
*   **The Monolith Effect:** The Hero section uses a `skewY(-2deg)` transform that corrects to `0deg` on hover, simulating a heavy slab settling into place.
*   **Glass/Frost:** Cards use `backdrop-filter: blur(4px)` with very low opacity backgrounds (`rgba(255,255,255,0.03)`).

## 5. Layout Grid (The "Scaffold")
*   **Grid:** 12-column grid.
*   **The Rail:** Column 2 is reserved for a vertical "Rebar" decorative element that runs the full height of the page.
*   **Content:** Most content lives from Column 3 to 12.
*   **Mobile:** Collapses to a single column stack; the Rail is hidden.

---

# Part 2: Next.js Implementation Guide

To move this from a single HTML file to a scalable Next.js application, we will use **Next.js 14+ (App Router)**, **Tailwind CSS**, and **Framer Motion**.

### Recommended Stack
1.  **Framework:** Next.js (App Router)
2.  **Styling:** Tailwind CSS (easiest to map your specific values)
3.  **Animations:** Framer Motion (for the `reveal` and `hover` physics)
4.  **Internationalization:** `next-intl` (Robust handling for the UA/EN toggle)
5.  **Fonts:** `next/font/google`

### Tailwind Configuration Strategy
You should not hardcode hex values in components. Instead, extend your `tailwind.config.ts` to match the design tokens.

```typescript
// tailwind.config.ts snippet
theme: {
  extend: {
    colors: {
      bg: '#0f1011',
      panel: {
        900: '#141618',
        850: '#1a1d20',
      },
      bronze: {
        DEFAULT: '#b5793a',
        deep: '#8c5a25',
      },
      steel: '#7d7d7d',
    },
    fontFamily: {
      sans: ['var(--font-inter)'],
      mono: ['var(--font-ibm-plex-mono)'],
    },
    backgroundImage: {
      'rebar-pattern': "repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 2px, transparent 2px, transparent 10px)",
      'noise': "url('/noise.svg')", // Save the SVG data URI as a file
    }
  }
}
```

---

# Part 3: The "Master Prompt" for AI Generation

If you want to use an AI (like ChatGPT, Claude, Cursor, or v0) to build this Next.js app for you, use the following prompt. It contains the context, the style data, and the specific architectural instructions.

### Copy & Paste this Prompt:

```markdown
I need you to build a high-quality, production-ready landing page for "The Order of Veterans" using Next.js 14 (App Router), Tailwind CSS, and Framer Motion.

## 1. Context & Branding
This is a website for a veteran organization focused on honor, discipline, and support.
The design style is "Industrial Brutalist."
- Keywords: Concrete, Rebar, Bronze, Heavy Shadows, Monolithic.
- Vibe: Serious, strong, non-decorative, functional.

## 2. Technical Requirements
- **Framework:** Next.js 14 (TypeScript).
- **Styling:** Tailwind CSS. Use `clsx` or `tailwind-merge` for class logic.
- **Animations:** Use `framer-motion` for scroll reveal animations and the "skew" hover effect on the hero section.
- **Fonts:** Use `next/font/google` for 'Inter' and 'IBM Plex Mono'.
- **I18n:** Create a mock implementation for language switching (UA/EN) using a React Context or simple state for now (prepare structure for `next-intl`).

## 3. Design Tokens (Add these to Tailwind Config)
- Background: `#0f1011`
- Surface Dark: `#141618`
- Surface Light: `#1a1d20`
- Text Main: `#e7e7e7`
- Text Muted: `#8b8f96`
- Accent Bronze: `#b5793a`
- Steel Gray: `#7d7d7d`
- Rebar Pattern CSS: `repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 2px, transparent 2px, transparent 10px)`

## 4. Key Components to Build
1.  **Layout Wrapper:** Needs a global noise texture overlay (opacity 0.05).
2.  **The Scaffold Grid:** A 12-column grid. Column 2 is a "Rebar Rail" (a vertical decorative steel bar that runs the page height). Content lives in cols 3-12.
3.  **Hero Monolith:** A large card component that has `transform: skewY(-2deg)` by default, and animates to `0deg` on hover. It should look like a heavy concrete slab.
4.  **Stats Row:** Cards with a thick top border (Steel color by default, Bronze on hover).
5.  **Industrial Card:** Dark gradient background with a subtle "Rebar Pattern" overlay.
6.  **Typography:**
    - `H1`: Massive, uppercase, tight leading (0.86), tracking (-0.05em).
    - `Mono Tags`: Uppercase, wide spacing, small size.

## 5. Content Structure (One Page)
- **Nav:** Logo, Links (About, Directions, Events, Docs, Contact), Language Toggle, "Support" Button (bordered).
- **Hero:** Title: "STRENGTH BEYOND TENSION". Subtitle about veteran spirit acting like rebar in concrete.
- **Stats:** 3 Cards (Support Streams, Internal Order, Principle).
- **About Section:** 3 Cards (Community, The Order, Honor Court).
- **Directions:** Grid of 6 services (Adaptation, Legal, Psych, etc.).
- **Footer:** Copyright and "Reinforcing the Future" tagline.

## 6. Execution Guide
Please start by setting up the `layout.tsx` with the fonts and global CSS for the noise texture. Then create a reusable `Section` component that respects the grid layout. Implement the "Rebar Rail" as a separate component that sits in the layout.
```

---

# Part 4: Implementation Checklist

When you use the prompt above, follow this checklist to ensure the quality matches your prototype:

1.  **The Noise Filter:**
    The provided HTML uses a Data URI SVG for noise. In Next.js, create a file `public/noise.svg` with that content, or use a CSS module to apply it to `body::after`. This is crucial for the "gritty" texture.
2.  **The Rebar Rail:**
    Ensure the vertical line (`grid-column: 2`) hides gracefully on Mobile screens (`hidden md:block`).
3.  **Scroll Animations:**
    The prototype uses a CSS `@keyframes reveal`. In React/Framer Motion, replace this with:
    ```jsx
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
    ```
4.  **Language State:**
    Since the content is static in the prototype, use a JSON object for translations (like the `I18N` const in your script) and load it into a generic `dictionary.ts` file in Next.js. This makes switching to a real CMS/Headless setup easier later.