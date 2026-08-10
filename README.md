# Aniket Kakad — Personal Portfolio (2026)

A modern, high-performance developer portfolio featuring a living real-time ASCII portrait canvas, interactive project showcase, dark editorial aesthetic, and smooth kinetic motion design.

---

## ✨ Features

- **Living ASCII Engine**: Real-time canvas-based ASCII portrait animation and ambient matrix background running at 120 FPS with single-pass GPU batching.
- **Interactive Project Suite**: Project modal preview system with live badges, tech stack breakdown, and GitHub links for featured projects:
  - **Zenius AI**: AI-powered learning platform with smart quizzes and certificates.
  - **CaptionFlow**: Multilingual live captioning engine supporting 99+ languages with sub-100ms response times.
  - **LinkGuard**: Cyber threat detection tool analyzing malicious links and phishing vectors.
  - **Loopora**: Real-time WebRTC virtual classroom engine for interactive learning.
- **Kinetic Smooth Scroll**: Powered by Lenis and GSAP ScrollTrigger for fluid, inertia-based navigation.
- **Responsive Dark Editorial UI**: Crafted with custom CSS variables, refined typography (Space Grotesk + Space Mono), and mobile-first grid layouts.

---

## 🛠️ Tech Stack

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+), CSS3
- **Graphics Engine**: HTML5 2D Canvas (Custom ASCII Luminance Rendering Pipeline)
- **Animation & Motion**: GSAP 3.13 (ScrollTrigger), Lenis Smooth Scroll (1.1)
- **Design Tokens**: Custom CSS Variables, Google Fonts (`Space Grotesk`, `Space Mono`)

---

## 📁 Repository Structure

```
Aniket/
├── assets/                  # Project screenshots & portrait source image
│   ├── captionflow.png
│   ├── linkguard.png
│   ├── loopora.png
│   ├── portrait.png
│   └── zenius.png
├── css/                     # Production stylesheets
│   └── style.css            # Design tokens, hero grid, animations, responsive rules
├── js/                      # JavaScript modules
│   ├── ascii.js             # Real-time ASCII animation engine
│   ├── main.js              # GSAP animations, Lenis scroll, modal logic, nav interactions
│   └── portrait-data.js     # High-precision pre-computed luminance matrix
├── preview/                 # Portfolio section preview captures
├── Aniket_Kakad_Resume.pdf  # Downloadable PDF resume
├── favicon.svg              # SVG Favicon
├── index.html               # Main HTML entry point
├── .env.example             # Environment configuration template
├── .gitignore               # Git exclusion rules
└── README.md                # Project documentation
```

---

## 🚀 Quick Start & Local Development

No heavy build step or Node compilation required. You can run the portfolio locally using any static web server:

### Option 1: Python HTTP Server (Built-in)
```bash
# Run from the project root directory
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node.js `http-server` or `serve`
```bash
npx http-server . -p 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 📄 License

Created by **Aniket Kakad**. All rights reserved.
