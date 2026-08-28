<div id="overview"></div>

While browsing job postings on Naukri.com, I noticed something frustrating. Whether a job had 105 applicants or 3,900 applicants, the UI showed the exact same badge: **"100+ Applicants"**. 

For job seekers trying to gauge competition and response rates, `100+ Applicants` is virtually meaningless. There is a massive difference between applying to a role with 110 applicants versus a role flooded with 4,000 applications.

I decided to open DevTools, inspect Naukri's network traffic, and build a browser extension to fix it.

<!-- IN-BODY MOBILE TABLE OF CONTENTS (Visible on Mobile/Tablet) -->
<div class="toc-container toc-mobile-only">
  <div class="toc-head">
    <span class="toc-title">TABLE OF CONTENTS</span>
  </div>
  <ul class="toc-list">
    <li><a href="#overview"><span class="toc-num">00</span> Introduction</a></li>
    <li><a href="#finding-the-data"><span class="toc-num">01</span> Finding the Underlying Data</a></li>
    <li><a href="#architecture"><span class="toc-num">02</span> Chrome Extension Architecture (Manifest V3)</a></li>
    <li><a href="#privacy"><span class="toc-num">03</span> Handling Edge Cases &amp; Privacy</a></li>
    <li><a href="#demo-video"><span class="toc-num">04</span> Demo Video &amp; Build Share</a></li>
    <li><a href="#source-code"><span class="toc-num">05</span> Source Code</a></li>
  </ul>
</div>

---

<h2 class="blog-h2" id="finding-the-data">1. Finding the Underlying Data</h2>

I opened Chrome DevTools Network panel, filtered for Fetch/XHR requests, and navigated through a few job postings.

Naukri's web client fetches JSON job details from internal API endpoints like `/jobapi/v3/job/...`. When inspecting the raw response payloads, the server wasn't returning rounded strings. It was returning raw integers:

```json
{
  "applyCount": 3781,
  "vacancy": 12,
  "viewCount": 18450
}
```

The UI was intentionally rounding `applyCount` down to `100+` or `500+` before rendering the HTML. The actual exact numbers were already sitting in memory in the browser.

---

<h2 class="blog-h2" id="architecture">2. Chrome Extension Architecture (Manifest V3)</h2>

I built **Naukri Exact Applicants** as a privacy-first Manifest V3 extension. 

Because modern Chrome extensions run content scripts in an isolated execution environment, content scripts cannot directly inspect page-level `window.fetch` or `XMLHttpRequest` objects. To capture the network responses reliably without making secondary duplicate requests, I designed a multi-layer architecture:

<!-- START_PIPELINE -->
<div class="svg-diagram-wrap">
  <svg viewBox="0 0 800 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="'Space Grotesk', system-ui, -apple-system, sans-serif">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#121216"/>
        <stop offset="100%" stop-color="#18181F"/>
      </linearGradient>

      <marker id="arrowOrange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#FF4D00" />
      </marker>
      <marker id="arrowPurple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#A855F7" />
      </marker>
      <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#10B981" />
      </marker>
    </defs>

    <!-- Outer Frame -->
    <rect x="2" y="2" width="796" height="536" rx="14" fill="url(#bgGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />

    <!-- Top Window Bar -->
    <path d="M 2 16 Q 2 2 16 2 L 784 2 Q 798 2 798 16 L 798 44 L 2 44 Z" fill="#1A1A20" />
    <line x1="2" y1="44" x2="798" y2="44" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />

    <!-- Dots -->
    <circle cx="24" cy="23" r="5" fill="#FF5F56" />
    <circle cx="40" cy="23" r="5" fill="#FFBD2E" />
    <circle cx="56" cy="23" r="5" fill="#27C93F" />

    <!-- Header Titles -->
    <text x="80" y="27" fill="#A1A1AA" font-size="12" font-family="'Space Mono', monospace" font-weight="700" letter-spacing="1">EXTENSION DATA INTERCEPTION PIPELINE</text>
    <rect x="660" y="13" width="120" height="20" rx="4" fill="rgba(255, 77, 0, 0.15)" stroke="#FF4D00" stroke-width="1" />
    <text x="720" y="27" fill="#FF4D00" font-size="10" font-family="'Space Mono', monospace" font-weight="700" text-anchor="middle">MANIFEST V3</text>

    <!-- NODE 1: MAIN WORLD -->
    <g transform="translate(180, 68)">
      <rect x="0" y="0" width="440" height="90" rx="10" fill="#1B1B22" stroke="#3B82F6" stroke-width="2" />
      <rect x="12" y="-10" width="170" height="20" rx="4" fill="#1D283A" stroke="#3B82F6" stroke-width="1" />
      <text x="97" y="4" fill="#60A5FA" font-size="10" font-family="'Space Mono', monospace" font-weight="700" text-anchor="middle">MAIN WORLD (Page Context)</text>
      
      <text x="20" y="34" fill="#FFFFFF" font-size="16" font-weight="700">mainWorldScript.js</text>
      <text x="20" y="54" fill="#A1A1AA" font-size="12">Hooks window.fetch &amp; XMLHttpRequest in page memory</text>
      <text x="20" y="74" fill="#34D399" font-size="11" font-family="'Space Mono', monospace">Intercepts /jobapi/ JSON responses -&gt; applyCount: 3781</text>
    </g>

    <!-- CONNECTOR 1: DOWN TO ISOLATED WORLD -->
    <path d="M 400 158 L 400 198" stroke="#FF4D00" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arrowOrange)" />
    <rect x="315" y="170" width="170" height="20" rx="10" fill="#121216" stroke="#FF4D00" stroke-width="1" />
    <text x="400" y="184" fill="#FF4D00" font-size="10" font-family="'Space Mono', monospace" font-weight="700" text-anchor="middle">window.postMessage</text>

    <!-- NODE 2: ISOLATED WORLD -->
    <g transform="translate(180, 206)">
      <rect x="0" y="0" width="440" height="85" rx="10" fill="#1B1B22" stroke="#FF4D00" stroke-width="2" />
      <rect x="12" y="-10" width="140" height="20" rx="4" fill="#2D1A15" stroke="#FF4D00" stroke-width="1" />
      <text x="82" y="4" fill="#FF7A3D" font-size="10" font-family="'Space Mono', monospace" font-weight="700" text-anchor="middle">ISOLATED WORLD</text>
      
      <text x="20" y="34" fill="#FFFFFF" font-size="16" font-weight="700">contentScript.js</text>
      <text x="20" y="54" fill="#A1A1AA" font-size="12">Content script coordinator. Validates active jobId &amp; security.</text>
      <text x="20" y="72" fill="#E4E4E7" font-size="11" font-family="'Space Mono', monospace">Dispatches extracted data payload to sub-modules</text>
    </g>

    <!-- BRANCHING ARROWS -->
    <path d="M 400 291 L 400 320" stroke="rgba(255, 255, 255, 0.25)" stroke-width="2" />
    <path d="M 205 320 L 595 320" stroke="rgba(255, 255, 255, 0.25)" stroke-width="2" />
    <path d="M 205 320 L 205 354" stroke="#A855F7" stroke-width="2" marker-end="url(#arrowPurple)" />
    <path d="M 595 320 L 595 354" stroke="#10B981" stroke-width="2" marker-end="url(#arrowGreen)" />

    <!-- NODE 3A: SPA LISTENER -->
    <g transform="translate(30, 364)">
      <rect x="0" y="0" width="350" height="142" rx="10" fill="#1B1B22" stroke="#A855F7" stroke-width="2" />
      <rect x="12" y="-10" width="130" height="20" rx="4" fill="#261A33" stroke="#A855F7" stroke-width="1" />
      <text x="77" y="4" fill="#C084FC" font-size="10" font-family="'Space Mono', monospace" font-weight="700" text-anchor="middle">SPA NAVIGATION</text>
      
      <text x="20" y="34" fill="#FFFFFF" font-size="15" font-weight="700">navigationObserver.js</text>
      <text x="20" y="55" fill="#A1A1AA" font-size="12">Monitors SPA soft navigations:</text>
      <text x="20" y="77" fill="#C084FC" font-size="11" font-family="'Space Mono', monospace">• pushState &amp; popstate events</text>
      <text x="20" y="96" fill="#C084FC" font-size="11" font-family="'Space Mono', monospace">• MutationObserver DOM changes</text>
      <text x="20" y="120" fill="#71717A" font-size="11">Triggers updates on page switches</text>
    </g>

    <!-- NODE 3B: DOM INJECTOR -->
    <g transform="translate(420, 364)">
      <rect x="0" y="0" width="350" height="142" rx="10" fill="#1B1B22" stroke="#10B981" stroke-width="2" />
      <rect x="12" y="-10" width="120" height="20" rx="4" fill="#162B23" stroke="#10B981" stroke-width="1" />
      <text x="72" y="4" fill="#34D399" font-size="10" font-family="'Space Mono', monospace" font-weight="700" text-anchor="middle">DOM INJECTION</text>
      
      <text x="20" y="34" fill="#FFFFFF" font-size="15" font-weight="700">uiInjector.js</text>
      <text x="20" y="54" fill="#A1A1AA" font-size="12">TreeWalker native text replacement:</text>
      
      <rect x="20" y="65" width="310" height="38" rx="4" fill="#121216" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
      <text x="30" y="81" fill="#EF4444" font-size="11" font-family="'Space Mono', monospace" text-decoration="line-through">100+ Applicants</text>
      <text x="155" y="81" fill="#34D399" font-size="11" font-family="'Space Mono', monospace" font-weight="700">➜ 3,781 Applicants</text>
      <text x="30" y="96" fill="#A1A1AA" font-size="10" font-family="'Space Mono', monospace">+ Openings (12) &amp; Views (18.4k) badges</text>
      <text x="20" y="122" fill="#71717A" font-size="11">Zero layout shifts or UI flicker</text>
    </g>
  </svg>
</div>
<!-- END_PIPELINE -->

### Key Modules:
- **`mainWorldScript.js`**: Injected into Chrome's `MAIN` execution world (`world: "MAIN"` in Manifest V3). It hooks `fetch` and `XMLHttpRequest.prototype.open` to intercept responses matching Naukri job API patterns and broadcasts extracted data via `window.postMessage`.
- **`contentScript.js`**: Listens for `postMessage` events in the isolated content script world, extracts and validates the job ID, and dispatches data to sub-modules.
- **`apiFetcher.js`**: Handles intercepted API data payload parsing, fallback network checks, and response validation.
- **`jobDetector.js`**: Extracts internal numerical job IDs from URL paths (e.g. `job-listings-...-<jobId>`) or DOM datasets.
- **`navigationObserver.js`**: Naukri operates as a Single Page Application (SPA). As you click between job listings, the page doesn't reload. `navigationObserver.js` listens to `pushState`, `replaceState`, `popstate`, and DOM mutations to trigger instant updates on soft navigations.
- **`uiInjector.js`**: Uses a DOM `TreeWalker` to locate the exact text nodes displaying `100+ Applicants` and updates them in place with exact counts (e.g. `3,781 Applicants`). It also appends subtle dark badges for `Openings` (12) and `Views` (18.4k).

---

<h2 class="blog-h2" id="privacy">3. Handling Edge Cases & Privacy</h2>

### Exact vs. Rounded Data
The extension never guesses or extrapolates numbers. If a job listing payload contains an exact `applyCount`, it displays the exact value. If Naukri's response payload only contains a rounded range, the extension displays what is available without fabricating numbers.

### Zero Telemetry & Privacy-First
I wanted this tool to be 100% private:
- No external backend servers.
- No analytics or tracking scripts.
- No database.
- Minimal permissions: only `storage` (for local extension popup options) and host permission for `naukri.com`. All network inspection and DOM manipulation happen locally inside the user's browser.

---

<h2 class="blog-h2" id="demo-video">4. Demo Video & Build Share</h2>

I posted a video walkthrough showing the extension in action on X:

<!-- START_X_EMBED -->
<div class="x-embed-card">
  <div class="x-embed-inner">
    <blockquote class="twitter-tweet" data-theme="dark" data-dnt="true">
      <p lang="en" dir="ltr">Built a Chrome extension for Naukri that replaces rounded &quot;100+ Applicants&quot; badges with exact applicant counts, vacancies, and views.</p>&mdash; Aniket Kakad (@Anik3t_kakad) <a href="https://x.com/Anik3t_kakad/status/2092594612066226384?s=20">August 26, 2026</a>
    </blockquote>
    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
  </div>
  <a href="https://x.com/Anik3t_kakad/status/2092594612066226384?s=20" target="_blank" rel="noopener" class="x-link-btn">
    View original post on X &rarr;
  </a>
</div>
<!-- END_X_EMBED -->

---

<h2 class="blog-h2" id="source-code">5. Source Code</h2>

The extension is open-source under the MIT license on GitHub:

- **GitHub Repository**: [AniketK100/naukri-applicant-count](https://github.com/AniketK100/naukri-applicant-count)
- **Tech Stack**: JavaScript (ES6+), Manifest V3, HTML5, CSS3.
