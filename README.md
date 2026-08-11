# Aniket Kakad — Personal Portfolio

A modern, high-performance developer portfolio featuring a living real-time ASCII portrait canvas, interactive project showcase, dark editorial aesthetic, and smooth kinetic motion design.

---

## ✨ Features

- **Living ASCII Engine**: Real-time canvas-based ASCII portrait animation and ambient matrix background running at 120 FPS with single-pass GPU batching.
- **Interactive Project Suite**: Project modal preview system with live badges, tech stack breakdown, and GitHub links for featured projects:
  - **Zenius AI**: AI-powered e-learning platform with WebRTC live classrooms, Gemini AI quizzes & certificates.
  - **CaptionFlow**: Multilingual AI video captioning platform with styled subtitle export.
  - **LinkGuard**: URL shortener under 100ms with analytics, QR codes & Redis caching.
  - **Loopora**: AI interview preparation platform with 500+ questions & video explanations.
- **Kinetic Smooth Scroll**: Powered by Lenis and GSAP ScrollTrigger for fluid, inertia-based navigation.
- **Responsive Dark Editorial UI**: Crafted with custom CSS variables, refined typography (Space Grotesk + Space Mono), and mobile-first grid layouts.
- **SEO & Social Optimized**: OpenGraph, Twitter Cards, Schema.org JSON-LD, hreflang, robots.txt, sitemap.xml, and llms.txt.

---

## 🛠️ Tech Stack

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+), CSS3
- **Graphics Engine**: HTML5 2D Canvas (Custom ASCII Luminance Rendering Pipeline)
- **Animation & Motion**: GSAP 3.13 (ScrollTrigger), Lenis Smooth Scroll (1.1)
- **Design Tokens**: Custom CSS Variables, Google Fonts (`Space Grotesk`, `Space Mono`)
- **Image Format**: WebP (optimized at 98% quality for crisp UI screenshots)

---

## 📁 Repository Structure

```
Aniket/
├── assets/                  # Project screenshots & portrait (WebP)
│   ├── captionflow.webp
│   ├── linkguard.webp
│   ├── loopora.webp
│   ├── og-image.webp
│   ├── portrait.webp
│   └── zenius.webp
├── css/
│   └── style.css            # Design tokens, hero grid, animations, responsive rules
├── js/
│   ├── ascii.js             # Real-time ASCII animation engine
│   ├── main.js              # GSAP animations, Lenis scroll, modal logic, nav interactions
│   └── portrait-data.js     # High-precision pre-computed luminance matrix
├── Aniket_Kakad_Resume.pdf  # Downloadable PDF resume
├── favicon.svg              # SVG Favicon
├── index.html               # Main HTML entry point
├── llms.txt                 # LLM/AI crawler summary (llmstxt.org standard)
├── robots.txt               # Search engine crawl rules
├── sitemap.xml              # XML sitemap for search engines
├── .env.example             # Environment configuration template
├── .gitignore               # Git exclusion rules
└── README.md                # Project documentation
```

---

## 🚀 Quick Start & Local Development

No heavy build step or Node compilation required. Run the portfolio locally using any static web server:

### Option 1: Python HTTP Server (Built-in)
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

## 📄 License

Created by **Aniket Kakad**. All rights reserved.
