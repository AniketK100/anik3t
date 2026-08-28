# Aniket Kakad — Personal Portfolio & Engineering Ecosystem

<div align="center">
  <p>
    <a href="https://anik3t.vercel.app/"><img src="https://img.shields.io/badge/LIVE_SITE-anik3t.vercel.app-FF4D00?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Portfolio" /></a>
    <a href="https://github.com/AniketK100"><img src="https://img.shields.io/badge/GITHUB-AniketK100-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile" /></a>
    <a href="https://x.com/Anik3t_kakad"><img src="https://img.shields.io/badge/X_/_TWITTER-@Anik3t__kakad-000000?style=for-the-badge&logo=x&logoColor=white" alt="X Profile" /></a>
  </p>
  <p>
    <strong>A high-performance developer portfolio featuring a real-time ASCII portrait canvas, interactive project modal suite, technical blog, and smooth kinetic motion design.</strong>
  </p>
</div>

---

## 🌐 Live Pages & Routing

- **🏠 [Official Portfolio](https://anik3t.vercel.app/)** — Interactive homepage featuring ASCII portrait, projects, tech stack, certifications, and live GitHub contributions.
- **👤 [About Page](https://anik3t.vercel.app/about)** — In-depth professional background, education at Watumull Institute, internship experience, and full skill matrix.
- **✍️ [Engineering Blog](https://anik3t.vercel.app/blog/)** — Technical write-ups, browser extension deep dives, reverse engineering, and systems architecture.
  - 📄 **[Naukri Exact Applicant Count Write-Up](https://anik3t.vercel.app/blog/naukri-exact-applicant-count/)** — Technical deep dive on Manifest V3 `MAIN` execution world DOM & API interception.
- **📬 [Contact Page](https://anik3t.vercel.app/contact)** — Direct communication channels, social endpoints, and verified location details.
- **🔒 [Privacy Policy](https://anik3t.vercel.app/privacy)** — Transparent telemetry and privacy statement regarding PostHog analytics and cookie-free tracking.
- **🤖 [llms.txt](https://anik3t.vercel.app/llms.txt)** — Machine-readable identity disambiguation and project index for AI retrieval systems.
- **🗺️ [sitemap.xml](https://anik3t.vercel.app/sitemap.xml)** — Canonical XML sitemap for search engine crawlers.

---

## ✨ Key Features

- **Living ASCII Engine**: Real-time canvas-based ASCII portrait animation with dynamic matrix background and single-pass GPU batching.
- **Interactive Project Suite**: Glassmorphic modal preview system with live badges, tech stack pills, and direct repository/live deployment links.
- **Scalable Markdown Blog Platform**: Custom Node.js static generator (`scripts/build-blog.js`) transforming Markdown into semantic HTML with Schema.org `BlogPosting` JSON-LD.
- **Kinetic Motion & Smooth Scroll**: Powered by Lenis inertia scrolling and GSAP ScrollTrigger for fluid, butter-smooth navigation.
- **Search Engine & Entity Optimized**: Comprehensive Schema.org JSON-LD graph (`WebSite`, `Person`, `ProfilePage`, `CollectionPage`, `BlogPosting`), OpenGraph, Twitter Cards, and RFC 9309-compliant robots.txt.
- **Zero-Dependency Core**: Pure vanilla HTML5, modern CSS3 (Custom Variables, Flexbox/Grid), and ES6+ JavaScript.

---

## 🚀 Featured Projects

| Project | Description | Stack | Links |
| :--- | :--- | :--- | :--- |
| **Zenius AI** | AI-powered learning platform with WebRTC live classrooms, document-to-quiz generator, and automated certificates. | React, Node.js, Express, MongoDB, WebRTC, Socket.IO, Gemini API | [GitHub](https://github.com/Mediwateyash/Live-Meet) • [Live Demo](https://live-meet.onrender.com/) |
| **CaptionFlow** | Multilingual AI video captioning with Groq Whisper & Sarvam AI transcription, LCS timestamp sync, and FFmpeg rendering. | React, Node.js, Express, FFmpeg, Groq Whisper, Sarvam AI | [GitHub](https://github.com/AniketK100/AI-Powered-Video-Captioning-Language-Conversion-Platform) |
| **LinkGuard** | High-performance URL shortener under 100ms with Redis caching, bcrypt password protection, QR codes, and analytics. | Spring Boot, Java, PostgreSQL, Redis, React, Docker | [GitHub](https://github.com/AniketK100/LinkGuard) • [Live Demo](https://link-guard-two.vercel.app/) |
| **Loopora** | AI interview preparation platform serving 500+ questions with written answers, video explanations, and Gemini API. | Next.js, TypeScript, MongoDB, Tailwind CSS, Gemini API | [GitHub](https://github.com/AniketK100/Loopora) • [Live Demo](https://loopora.vercel.app/) |
| **Naukri Exact Count Extension** | Privacy-first Manifest V3 extension extracting exact applicants, openings, and views from Naukri job APIs. | JavaScript, Manifest V3, Chrome Extension API | [GitHub](https://github.com/AniketK100/naukri-applicant-count) • [Article](https://anik3t.vercel.app/blog/naukri-exact-applicant-count/) |

---

## 🛠️ Tech Stack

- **Languages & Frontend**: HTML5, CSS3, JavaScript (ES6+), TypeScript, React, Next.js, Tailwind CSS
- **Backend & Real-Time**: Node.js, Express.js, Java, Spring Boot, WebRTC, Socket.IO
- **Databases & Caching**: PostgreSQL, MongoDB, Redis
- **DevOps & Infrastructure**: Docker, Git, GitHub Actions, Vercel
- **AI & Media Tools**: Gemini API, Groq Whisper, Sarvam AI, FFmpeg
- **Motion & Graphics**: GSAP 3.13, ScrollTrigger, Lenis 1.1, HTML5 Canvas 2D

---

## 📁 Repository Structure

```
AniketkaPort/
├── 404.html                 # Machine-readable 404 error page with recovery routing
├── about/                   # About page (/about)
├── assets/                  # High-resolution WebP UI previews and diagrams
│   └── blog/                # Blog article graphics and visual schematics
├── blog/                    # Generated static blog platform (/blog/)
│   ├── index.html           # Blog index with client-side keyword search
│   └── naukri-exact-applicant-count/
├── contact/                 # Contact page (/contact)
├── content/                 # Source Markdown files & metadata schemas
│   └── blog/                # Blog post source folders (post.md + metadata.json)
├── css/
│   └── style.css            # Global design tokens, animations, responsive rules
├── js/
│   ├── analytics.js         # Analytics loader (GA4 & PostHog)
│   ├── ascii.js             # Canvas ASCII portrait animation engine
│   ├── main.js              # GSAP animations, Lenis scroll, modal logic, nav
│   └── portrait-data.js     # ASCII character matrix data
├── privacy/                 # Privacy policy (/privacy)
├── scripts/
│   └── build-blog.js        # Static blog page & sitemap generator script
├── favicon.svg              # SVG brand favicon
├── index.html               # Homepage entry point (/)
├── llms.txt                 # LLM / AI retrieval disambiguation specification
├── robots.txt               # Search engine crawl rules (RFC 9309 compliant)
├── sitemap.xml              # Canonical XML sitemap
├── test-seo.js              # Automated SEO, Schema, and Route verification suite
└── README.md                # Project documentation
```

---

## 💻 Local Development

No build step or heavy package installation is required to view the portfolio — it is built on modern vanilla web standards.

### Running Locally
```bash
# Option 1: Python HTTP Server
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server . -p 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🧪 Testing & Validation

Run the automated SEO and schema verification test suite:

```bash
# 1. Run the test suite
node test-seo.js

# 2. Rebuild blog pages & sitemap from content/blog/
node scripts/build-blog.js
```

---

## 📬 Contact & Identity

- **Developer**: Aniket Kakad
- **Portfolio**: [https://anik3t.vercel.app/](https://anik3t.vercel.app/)
- **GitHub**: [@AniketK100](https://github.com/AniketK100)
- **X / Twitter**: [@Anik3t_kakad](https://x.com/Anik3t_kakad)
- **Email**: [aniketkakad8282@gmail.com](mailto:aniketkakad8282@gmail.com)
- **Location**: Mumbai, Maharashtra, India

---

## 📄 License

Created by **Aniket Kakad**. All rights reserved.
