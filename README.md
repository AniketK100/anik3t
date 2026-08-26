# Aniket Kakad — Personal Portfolio

A modern, high-performance developer portfolio featuring a living real-time ASCII portrait canvas, interactive project showcase, dark editorial aesthetic, and smooth kinetic motion design.

---

## ✨ Features

- **Living ASCII Engine**: Real-time canvas-based ASCII portrait animation and ambient matrix background with single-pass GPU batching.
- **Interactive Project Suite**: Project modal preview system with live badges, tech stack breakdown, and GitHub links for featured projects:
  - **Zenius AI**: AI-powered e-learning platform with WebRTC live classrooms, Gemini AI quizzes & certificates.
  - **CaptionFlow**: Multilingual AI video captioning platform with styled subtitle export.
  - **LinkGuard**: URL shortener under 100ms with analytics, QR codes & Redis caching.
  - **Loopora**: AI interview preparation platform with 500+ questions & video explanations.
- **Kinetic Smooth Scroll**: Powered by Lenis and GSAP ScrollTrigger for fluid, inertia-based navigation.
- **Fully Responsive UI**: Mobile-first layout with a dedicated mobile menu, adaptive grids, and fluid `clamp()`-based typography across phones, tablets, and desktops.
- **SEO & Social Optimized**: OpenGraph, Twitter Cards, Schema.org JSON-LD, hreflang, robots.txt, sitemap.xml, and llms.txt.

---

## 🛠️ Tech Stack

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+), CSS3
- **Graphics Engine**: HTML5 2D Canvas (Custom ASCII Luminance Rendering Pipeline)
- **Animation & Motion**: GSAP 3.13 (ScrollTrigger), Lenis Smooth Scroll (1.1)
- **Design Tokens**: Custom CSS Variables, Google Fonts (`Space Grotesk`, `Space Mono`)
- **Image Format**: WebP (optimized for crisp UI screenshots)

---

## 📁 Repository Structure

```
Aniket/
├── assets/                  # Project screenshots & social image (WebP)
│   ├── captionflow.webp
│   ├── linkguard.webp
│   ├── loopora.webp
│   ├── og-image.webp
│   └── zenius.webp
├── css/
│   └── style.css            # Design tokens, hero grid, animations, responsive rules
├── js/
│   ├── ascii.js             # Real-time ASCII animation engine
│   ├── main.js              # GSAP animations, Lenis scroll, modal logic, nav interactions
│   └── portrait-data.js     # High-precision pre-computed luminance matrix
├── favicon.svg              # SVG Favicon
├── index.html               # Main HTML entry point
├── llms.txt                 # LLM/AI crawler summary (llmstxt.org standard)
├── robots.txt               # Search engine crawl rules
├── sitemap.xml              # XML sitemap for search engines
├── .env.example             # Optional local server configuration template
├── .gitignore               # Git exclusion rules
└── README.md                # Project documentation
```

---

## 🚀 Quick Start & Local Development

No build step or package installation required — it's a pure static site. Run it with any static web server:

### Option 1: Python HTTP Server
```bash
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node.js
```bash
npx http-server . -p 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🌐 Deployment

Deploy the repository as-is to any static host — GitHub Pages, Vercel, Netlify, or Cloudflare Pages. No build command and no output directory are needed; publish the repository root directly.

---

## 📄 License

Created by **Aniket Kakad**. All rights reserved.
