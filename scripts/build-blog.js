const fs = require('fs');
const path = require('path');

// Basic Markdown to HTML renderer (pure Node.js, zero dependencies)
function renderMarkdown(md) {
  let html = md;

  // Code blocks (fenced ```)
  html = html.replace(/```([a-z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="code-block${lang ? ' lang-' + lang : ''}"><code>${escapedCode.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<code class="inline-code">${escaped}</code>`;
  });

  // Preserve raw HTML blocks (like pipeline-diagram and x-embed-card divs)
  const rawHtmlBlocks = [];
  html = html.replace(/<!-- START_PIPELINE -->[\s\S]*?<!-- END_PIPELINE -->/gi, (match) => {
    rawHtmlBlocks.push(match);
    return `___RAW_HTML_${rawHtmlBlocks.length - 1}___`;
  });
  html = html.replace(/<!-- START_X_EMBED -->[\s\S]*?<!-- END_X_EMBED -->/gi, (match) => {
    rawHtmlBlocks.push(match);
    return `___RAW_HTML_${rawHtmlBlocks.length - 1}___`;
  });
  html = html.replace(/<div class="x-embed-card">[\s\S]*?<\/div>/gi, (match) => {
    rawHtmlBlocks.push(match);
    return `___RAW_HTML_${rawHtmlBlocks.length - 1}___`;
  });

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="blog-h3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="blog-h2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="blog-h1">$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="blog-hr" />');

  // Unordered lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="blog-li">$1</li>');
  html = html.replace(/(<li class="blog-li">[\s\S]*?<\/li>\n?)+/g, '<ul class="blog-ul">\n$&</ul>\n');

  // Bold and Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Markdown links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="blog-link">$1</a>');

  // Paragraphs (split by double newlines, ignoring block elements)
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul') || trimmed.startsWith('<hr') || trimmed.startsWith('<div') || trimmed.startsWith('<!--') || trimmed.startsWith('___RAW_HTML')) {
      return trimmed;
    }
    return `<p class="blog-p">${trimmed.replace(/\n/g, '<br />')}</p>`;
  }).join('\n\n');

  // Restore raw HTML blocks
  rawHtmlBlocks.forEach((raw, i) => {
    html = html.replace(`___RAW_HTML_${i}___`, raw);
  });

  return html;
}

// Calculate reading time in minutes
function getReadingTime(text) {
  const words = text.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Format date as "August 28, 2026"
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function buildBlog() {
  console.log('=== BUILDING BLOG SYSTEM & GENERATING STATIC PAGES ===\n');

  const contentDir = path.join(__dirname, '..', 'content', 'blog');
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Content directory not found at ${contentDir}`);
  }

  const posts = [];
  const slugs = fs.readdirSync(contentDir);

  slugs.forEach(slug => {
    const postDir = path.join(contentDir, slug);
    if (!fs.statSync(postDir).isDirectory()) return;

    const metaPath = path.join(postDir, 'metadata.json');
    const mdPath = path.join(postDir, 'post.md');

    if (!fs.existsSync(metaPath) || !fs.existsSync(mdPath)) {
      console.warn(`Skipping ${slug}: missing metadata.json or post.md`);
      return;
    }

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const htmlContent = renderMarkdown(mdContent);
    const readingTime = getReadingTime(mdContent);

    posts.push({
      ...metadata,
      slug,
      htmlContent,
      readingTime
    });
  });

  // Sort posts newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Common Header Nav & PostHog/GA Code
  const cspHeader = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://us-assets.i.posthog.com https://www.googletagmanager.com https://*.googletagmanager.com https://platform.twitter.com https://cdn.syndication.twimg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://ghchart.rshah.org https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.googletagmanager.com https://syndication.twitter.com https://pbs.twimg.com https://abs.twimg.com; connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com https://ghchart.rshah.org https://cdn.jsdelivr.net https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com https://cdn.syndication.twimg.com https://syndication.twitter.com; frame-src 'self' https://platform.twitter.com https://syndication.twitter.com https://x.com; worker-src 'self' blob:; base-uri 'self'; form-action 'self';`;

  const analyticsHead = `  <!-- Google Analytics (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-SVP8YVB8R1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-SVP8YVB8R1');
  </script>

  <!-- PostHog Analytics -->
  <script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}var w=e;for("undefined"!=typeof a?w=e[a]=[]:a="posthog",w.people=w.people||[],w.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},w.people.toString=function(){return w.toString(1)+".people (stub)"},p="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId setPersonPropertiesForFlags".split(" "),r=0;r<p.length;r++)g(w,p[r]);e._i.push([i,s,a])},e.__SV=1.0,
    n=t.createElement("script"),p=t.getElementsByTagName("script")[0],n.async=1,
    n.src=(window.location.protocol.indexOf('http')===0&&window.location.hostname.indexOf('vercel.app')!==-1)?"/ingest/static/array.js":"https://us-assets.i.posthog.com/static/array.js",
    p.parentNode.insertBefore(n,p))}(document,window.posthog||[]);
    var isVercel = window.location.protocol.indexOf('http') === 0 && window.location.hostname.indexOf('vercel.app') !== -1;
    posthog.init('phc_ng2VRfFtNoq2RLh6CNXLUxoQwF4TpySBtBnKY8xaME5F', {
      api_host: isVercel ? '/ingest' : 'https://us.i.posthog.com',
      ui_host: 'https://us.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true
    });
  </script>`;

  // 1. GENERATE /blog/index.html
  const blogIndexDir = path.join(__dirname, '..', 'blog');
  if (!fs.existsSync(blogIndexDir)) {
    fs.mkdirSync(blogIndexDir, { recursive: true });
  }

  const indexCardsHtml = posts.map(post => `
        <article class="blog-card" data-title="${post.title.toLowerCase()}" data-desc="${post.description.toLowerCase()}" data-category="${post.category}" data-tags="${post.tags.join(' ').toLowerCase()}">
          <a href="/blog/${post.slug}/" class="blog-card__cover-link" aria-label="${post.title}">
            <img src="${post.coverImage}" alt="${post.title}" class="blog-card__cover-img" loading="lazy" decoding="async" />
            <span class="blog-card__cat-badge">${post.category}</span>
          </a>
          <div class="blog-card__body">
            <div class="blog-card__meta">
              <time datetime="${post.date}">${formatDate(post.date)}</time>
              <span class="meta-dot">&bull;</span>
              <span>${post.readingTime} min read</span>
            </div>
            <h2 class="blog-card__title">
              <a href="/blog/${post.slug}/">${post.title}</a>
            </h2>
            <p class="blog-card__desc">${post.description}</p>
            <div class="blog-card__footer">
              <div class="blog-card__author">
                <span class="author-avatar">AK</span>
                <span class="author-name">Aniket Kakad</span>
              </div>
              <a href="/blog/${post.slug}/" class="blog-card__arrow" aria-label="Read article">
                <span>Read</span> &rarr;
              </a>
            </div>
          </div>
        </article>`).join('\n');

  const blogIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Aniket Kakad | Full-Stack Developer</title>
  <meta name="description" content="Technical write-ups, browser extensions, software architecture, performance optimizations, and developer experiments by Aniket Kakad.">
  <meta name="keywords" content="Aniket Kakad, Developer Blog, Chrome Extension, JavaScript, Software Engineering, Web Development">
  <meta name="author" content="Aniket Kakad">
  <meta name="robots" content="index, follow">
  <meta http-equiv="Content-Security-Policy" content="${cspHeader}">

  <!-- SEO, Hreflang & Canonical Links -->
  <link rel="canonical" href="https://anik3t.vercel.app/blog/">
  <link rel="describedby" href="/llms.txt">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Aniket Kakad">
  <meta property="og:url" content="https://anik3t.vercel.app/blog/">
  <meta property="og:title" content="Blog — Aniket Kakad | Full-Stack Developer">
  <meta property="og:description" content="Technical write-ups, browser extensions, software architecture, performance optimizations, and developer experiments by Aniket Kakad.">
  <meta property="og:image" content="https://anik3t.vercel.app/assets/og-image.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@Anik3t_kakad">
  <meta name="twitter:creator" content="@Anik3t_kakad">
  <meta name="twitter:title" content="Blog — Aniket Kakad | Full-Stack Developer">
  <meta name="twitter:description" content="Technical write-ups, browser extensions, software architecture, performance optimizations, and developer experiments by Aniket Kakad.">
  <meta name="twitter:image" content="https://anik3t.vercel.app/assets/og-image.webp">

  <!-- Structured Data (Schema.org / CollectionPage) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://anik3t.vercel.app/blog/#webpage",
        "url": "https://anik3t.vercel.app/blog/",
        "name": "Blog — Aniket Kakad | Full-Stack Developer",
        "description": "Technical write-ups, browser extensions, software architecture, performance optimizations, and developer experiments by Aniket Kakad.",
        "isPartOf": {
          "@id": "https://anik3t.vercel.app/#website"
        },
        "author": {
          "@id": "https://anik3t.vercel.app/#person"
        },
        "inLanguage": "en"
      }
    ]
  }
  </script>

  <!-- Fonts & Core Stylesheet -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">

${analyticsHead}

  <!-- Blog Platform Custom CSS -->
  <style>
    main#mainContent { min-height: calc(100vh - 200px); display: flex; flex-direction: column; }
    .blog-hero { padding: 80px var(--pad-inline) 15px; max-width: 1360px; margin: 0 auto; width: 100%; box-sizing: border-box; }
    .blog-hero__idx { font-family: var(--font-mono); font-size: var(--fs-label); color: var(--accent); letter-spacing: var(--ls-label); margin-bottom: 0.5rem; display: block; }
    .blog-hero__title { font-size: var(--fs-title); font-family: var(--font-disp); color: var(--text); font-weight: 700; line-height: 1.1; margin-bottom: 0.5rem; }
    .blog-hero__sub { font-size: 1rem; color: var(--text-2); margin-bottom: 1.4rem; font-family: var(--font-mono); }

    /* Search Bar Controls */
    .blog-controls { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.6rem; }
    .search-box { position: relative; max-width: 420px; width: 100%; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }
    .search-input { width: 100%; background: var(--panel); border: 1px solid var(--line); border-radius: 24px; padding: 0.55rem 1.1rem 0.55rem 2.7rem; color: var(--text); font-family: var(--font-mono); font-size: 0.85rem; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
    .search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(255, 77, 0, 0.15); }

    /* 3-Column Responsive Grid */
    .blog-grid-wrap { max-width: 1360px; margin: 0 auto 4rem; padding: 0 var(--pad-inline); width: 100%; box-sizing: border-box; flex-grow: 1; }
    .blog-grid { display: grid; grid-template-columns: 1fr; gap: 2.2rem; width: 100%; }

    @media (min-width: 640px) {
      .blog-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1080px) {
      .blog-grid { grid-template-columns: repeat(3, 1fr); }
    }

    /* Card Styling */
    .blog-card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: border-color 0.3s ease, transform 0.3s ease; }
    .blog-card:hover { border-color: var(--accent-line); transform: translateY(-4px); }
    .blog-card__cover-link { position: relative; display: block; aspect-ratio: 16/9; overflow: hidden; background: var(--bg-2); }
    .blog-card__cover-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .blog-card:hover .blog-card__cover-img { transform: scale(1.04); }
    .blog-card__cat-badge { position: absolute; top: 0.8rem; left: 0.8rem; font-family: var(--font-mono); font-size: 0.72rem; color: #FFF; background: rgba(14, 14, 16, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); padding: 0.25rem 0.65rem; border-radius: 4px; font-weight: 700; text-transform: uppercase; }

    .blog-card__body { padding: 1.6rem; display: flex; flex-direction: column; flex-grow: 1; }
    .blog-card__meta { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-3); margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem; }
    .meta-dot { color: var(--text-3); }
    .blog-card__title { font-size: 1.35rem; font-family: var(--font-disp); color: var(--text); font-weight: 700; line-height: 1.3; margin-bottom: 0.7rem; }
    .blog-card__title a { color: inherit; text-decoration: none; transition: color 0.2s; }
    .blog-card__title a:hover { color: var(--accent); }
    .blog-card__desc { font-size: 0.94rem; color: var(--text-2); line-height: 1.6; margin-bottom: 1.6rem; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    .blog-card__footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--line); padding-top: 1rem; margin-top: auto; }
    .blog-card__author { display: flex; align-items: center; gap: 0.6rem; }
    .author-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: #000; font-family: var(--font-mono); font-weight: 700; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; }
    .author-name { font-family: var(--font-mono); font-size: 0.82rem; color: var(--text); font-weight: 600; }
    .blog-card__arrow { font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent); font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 0.3rem; }

    .no-results { text-align: center; padding: 4rem 1rem; font-family: var(--font-mono); color: var(--text-3); font-size: 1rem; }

    /* Footer Styling */
    .footer {
      border-top: 1px solid var(--line);
      padding: 2.5rem var(--pad-inline);
      margin-top: auto;
      background: var(--bg);
      width: 100%;
      box-sizing: border-box;
    }
    .footer__inner {
      max-width: 1360px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .footer__logo {
      font-family: var(--font-disp);
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--text);
      letter-spacing: -0.02em;
    }
    .footer__logo em {
      color: var(--accent);
      font-style: normal;
    }
    .footer__links {
      display: flex;
      gap: 1.5rem;
      font-family: var(--font-mono);
      font-size: 0.82rem;
    }
    .footer__links a {
      color: var(--text-2);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer__links a:hover {
      color: var(--accent);
    }
  </style>
</head>
<body class="is-loaded">
  <a href="#mainContent" class="skip-link">Skip to main content</a>
  <div class="grain" aria-hidden="true"></div>

  <!-- ============ HEADER ============ -->
  <header class="site-head" id="siteHead">
    <a class="head__logo" href="/">ANIKET<em>.</em></a>
    <nav class="head__nav" aria-label="Primary">
      <a href="/#profile"><span class="n">01</span>PROFILE</a>
      <a href="/#experience"><span class="n">02</span>EXPERIENCE</a>
      <a href="/#work"><span class="n">03</span>PROJECTS</a>
      <a href="/#stack"><span class="n">04</span>TECH STACK</a>
      <a href="/#certifications"><span class="n">05</span>CERTIFICATIONS</a>
      <a href="/blog/" class="is-active" aria-current="page"><span class="n">06</span>BLOG</a>
      <a href="/contact"><span class="n">07</span>CONTACT</a>
    </nav>
    <div class="head__right">
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </header>

  <!-- ============ MOBILE MENU ============ -->
  <div class="menu" id="menu" aria-hidden="true">
    <nav class="menu__nav" aria-label="Mobile">
      <a href="/#profile" class="menu__link"><span>01</span>PROFILE</a>
      <a href="/#experience" class="menu__link"><span>02</span>EXPERIENCE</a>
      <a href="/#work" class="menu__link"><span>03</span>PROJECTS</a>
      <a href="/#stack" class="menu__link"><span>04</span>TECH STACK</a>
      <a href="/#certifications" class="menu__link"><span>05</span>CERTIFICATIONS</a>
      <a href="/blog/" class="menu__link is-active"><span>06</span>BLOG</a>
      <a href="/contact" class="menu__link"><span>07</span>CONTACT</a>
    </nav>
  </div>

  <main id="mainContent">
    <section class="blog-hero">
      <span class="blog-hero__idx">06 / BLOG</span>
      <h1 class="blog-hero__title">Engineering & Build Notes</h1>
      <p class="blog-hero__sub">Search by keyword or topic.</p>

      <div class="blog-controls">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="blogSearch" class="search-input" placeholder="Search posts..." aria-label="Search blog posts">
        </div>
      </div>
    </section>

    <section class="blog-grid-wrap">
      <div class="blog-grid" id="blogGrid">
${indexCardsHtml}
      </div>
      <div class="no-results" id="noResults" style="display: none;">
        <p>No articles found matching your search query.</p>
      </div>
    </section>
  </main>

  <!-- ============ FOOTER ============ -->
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <span class="footer__logo">ANIKET<em>.</em></span>
      </div>
      <div class="footer__links">
        <a href="https://github.com/AniketK100" target="_blank" rel="noopener">GitHub</a>
        <a href="https://x.com/Anik3t_kakad" target="_blank" rel="noopener">X / Twitter</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const searchInput = document.getElementById('blogSearch');
      const cards = document.querySelectorAll('.blog-card');
      const noResults = document.getElementById('noResults');

      function filterPosts() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let visibleCount = 0;

        cards.forEach(card => {
          const title = card.getAttribute('data-title') || '';
          const desc = card.getAttribute('data-desc') || '';
          const cat = card.getAttribute('data-category') || '';
          const tags = card.getAttribute('data-tags') || '';

          const matchesQuery = !query || title.includes(query) || desc.includes(query) || cat.toLowerCase().includes(query) || tags.includes(query);

          if (matchesQuery) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        if (noResults) {
          noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', filterPosts);
      }
    });
  </script>
  <script src="/js/analytics.js" defer></script>
  <script src="/js/main.js" defer></script>
</body>
</html>`;

  fs.writeFileSync(path.join(blogIndexDir, 'index.html'), blogIndexHtml, 'utf8');
  console.log('✓ Generated /blog/index.html');

  // 2. GENERATE /blog/<slug>/index.html FOR EACH POST
  posts.forEach(post => {
    const postOutputDir = path.join(blogIndexDir, post.slug);
    if (!fs.existsSync(postOutputDir)) {
      fs.mkdirSync(postOutputDir, { recursive: true });
    }

    const postJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `https://anik3t.vercel.app/blog/${post.slug}/#article`,
      "headline": post.title,
      "description": post.description,
      "image": `https://anik3t.vercel.app${post.coverImage}`,
      "keywords": post.tags.join(', '),
      "datePublished": post.date,
      "dateModified": post.date,
      "isPartOf": {
        "@id": "https://anik3t.vercel.app/#website"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://anik3t.vercel.app/blog/${post.slug}/`
      },
      "author": {
        "@type": "Person",
        "@id": "https://anik3t.vercel.app/#person",
        "name": "Aniket Kakad",
        "url": "https://anik3t.vercel.app/"
      },
      "publisher": {
        "@type": "Person",
        "@id": "https://anik3t.vercel.app/#person",
        "name": "Aniket Kakad",
        "url": "https://anik3t.vercel.app/"
      }
    };

    const postHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} — Aniket Kakad</title>
  <meta name="description" content="${post.description}">
  <meta name="keywords" content="${post.tags.join(', ')}, Aniket Kakad">
  <meta name="author" content="Aniket Kakad">
  <meta name="robots" content="index, follow">
  <meta http-equiv="Content-Security-Policy" content="${cspHeader}">

  <!-- SEO & Canonical Links -->
  <link rel="canonical" href="https://anik3t.vercel.app/blog/${post.slug}/">
  <link rel="describedby" href="/llms.txt">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Aniket Kakad">
  <meta property="og:url" content="https://anik3t.vercel.app/blog/${post.slug}/">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.description}">
  <meta property="og:image" content="https://anik3t.vercel.app${post.coverImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@Anik3t_kakad">
  <meta name="twitter:creator" content="@Anik3t_kakad">
  <meta name="twitter:title" content="${post.title}">
  <meta name="twitter:description" content="${post.description}">
  <meta name="twitter:image" content="https://anik3t.vercel.app${post.coverImage}">

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
${JSON.stringify(postJsonLd, null, 2)}
  </script>

  <!-- Fonts & Core Stylesheet -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">

${analyticsHead}

  <!-- Article Layout & Typography Custom CSS -->
  <style>
    .article-wrap { max-width: 1360px; margin: 0 auto; padding: 75px var(--pad-inline) 80px; display: grid; grid-template-columns: 1fr; gap: 3.5rem; }
    .article-main { min-width: 0; }
    .article-header { margin-bottom: 2.2rem; border-bottom: 1px solid var(--line); padding-bottom: 1.8rem; }
    .article-meta-top { font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent); display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
    .article-h1 { font-size: clamp(2.1rem, 4.5vw, 3.4rem); font-family: var(--font-disp); color: var(--text); font-weight: 700; line-height: 1.2; margin-bottom: 1rem; }
    .article-subtitle { font-size: 1.15rem; color: var(--text-2); line-height: 1.6; }
    
    /* Content Styling */
    .blog-p { font-size: 1.05rem; color: var(--text); line-height: 1.75; margin-bottom: 1.6rem; }
    .blog-h2 { font-size: 1.75rem; font-family: var(--font-disp); color: var(--text); font-weight: 700; margin: 2.8rem 0 1.2rem; border-bottom: 1px solid var(--line); padding-bottom: 0.5rem; }
    .blog-h3 { font-size: 1.3rem; font-family: var(--font-disp); color: var(--text); font-weight: 600; margin: 2.2rem 0 1rem; }
    .blog-ul { margin: 0 0 1.8rem 1.5rem; color: var(--text); line-height: 1.7; }
    .blog-li { margin-bottom: 0.5rem; }
    .blog-hr { border: none; border-top: 1px solid var(--line); margin: 3rem 0; }
    .blog-link { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
    .blog-link:hover { color: #ff6a26; }
    .inline-code { font-family: var(--font-mono); font-size: 0.9em; background: var(--panel); color: var(--accent); padding: 0.15em 0.4em; border-radius: 4px; border: 1px solid var(--line); }
    .code-block { background: var(--bg-2); border: 1px solid var(--line); border-radius: 6px; padding: 1.2rem; overflow-x: auto; margin: 1.5rem 0 2rem; font-family: var(--font-mono); font-size: 0.88rem; line-height: 1.6; color: var(--text); }
    .code-block code { font-family: inherit; }

    /* SVG Architecture Diagram Wrapper */
    .svg-diagram-wrap {
      margin: 2.5rem 0;
      width: 100%;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    }
    .svg-diagram-wrap svg {
      display: block;
      width: 100%;
      height: auto;
    }

    /* Modern Dark Pipeline Architecture Diagram Component */
    .pipeline-diagram {
      background: var(--bg-2);
      border: 1px solid var(--line-2);
      border-radius: 12px;
      margin: 2.5rem 0;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    }
    .pipeline-head {
      background: #18181C;
      padding: 0.8rem 1.2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid var(--line);
    }
    .pipeline-dots {
      display: flex;
      gap: 0.4rem;
    }
    .pipeline-dots .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .pipeline-dots .red { background: #FF5F56; }
    .pipeline-dots .yellow { background: #FFBD2E; }
    .pipeline-dots .green { background: #27C93F; }
    .pipeline-title {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-2);
      font-weight: 700;
      letter-spacing: 0.08em;
      flex-grow: 1;
    }
    .pipeline-tag {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--accent);
      background: var(--accent-soft);
      border: 1px solid var(--accent-line);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-weight: 700;
    }
    .pipeline-body {
      padding: 1.6rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }
    .pipeline-row {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }
    .step-pill {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-3);
      letter-spacing: 0.08em;
      display: inline-flex;
      align-items: center;
      width: fit-content;
      background: var(--panel);
      border: 1px solid var(--line);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
    }
    .step-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1.2rem 1.4rem;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .step-card:hover {
      border-color: var(--accent-line);
      transform: translateY(-2px);
    }
    .step-card--blue { border-left: 3px solid #3B82F6; }
    .step-card--orange { border-left: 3px solid var(--accent); }
    .step-card--purple { border-left: 3px solid #A855F7; }
    .step-card--green { border-left: 3px solid #10B981; }

    .step-header {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 0.6rem;
      flex-wrap: wrap;
    }
    .step-badge {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .badge-blue { color: #60A5FA; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-orange { color: #FF7A3D; background: var(--accent-soft); border: 1px solid var(--accent-line); }
    .badge-purple { color: #C084FC; background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.3); }
    .badge-green { color: #34D399; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); }

    .step-file {
      font-family: var(--font-disp);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text);
    }
    .step-text {
      font-size: 0.9rem;
      color: var(--text-2);
      line-height: 1.55;
      margin: 0;
    }
    .step-code {
      margin-top: 0.8rem;
      background: var(--bg-2);
      border: 1px solid var(--line);
      border-radius: 4px;
      padding: 0.5rem 0.8rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: #34D399;
    }

    .pipeline-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0.8rem 0;
      width: 100%;
    }
    .connector-line {
      width: 2px;
      height: 16px;
      background: var(--accent);
      opacity: 0.5;
    }
    .connector-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--accent);
      background: var(--bg);
      border: 1px solid var(--accent-line);
      padding: 0.2rem 0.7rem;
      border-radius: 12px;
      font-weight: 700;
    }

    .pipeline-subgrid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.2rem;
      width: 100%;
      box-sizing: border-box;
    }
    @media (min-width: 600px) {
      .pipeline-subgrid {
        grid-template-columns: 1fr 1fr;
      }
    }

    /* Sleek X Embed Card & Action Button */
    .x-embed-card {
      margin: 2.2rem 0;
      max-width: 550px;
      width: 100%;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 1.2rem;
      box-sizing: border-box;
    }
    .x-embed-inner {
      min-height: 250px;
      width: 100%;
    }
    .x-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--accent);
      background: var(--bg-2);
      border: 1px solid var(--accent-line);
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 700;
      margin-top: 1rem;
      transition: background 0.2s, border-color 0.2s;
    }
    .x-link-btn:hover {
      background: var(--accent-soft);
      border-color: var(--accent);
    }

    /* Table of Contents Styling */
    .toc-container {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 1.4rem 1.6rem;
      margin: 2.2rem 0;
    }
    .toc-head {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--accent);
      font-weight: 700;
      letter-spacing: 0.08em;
      margin-bottom: 0.8rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--line);
    }
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .toc-list li a {
      font-family: var(--font-mono);
      font-size: 0.86rem;
      color: var(--text-2);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      transition: color 0.2s, transform 0.2s;
    }
    .toc-list li a:hover,
    .toc-list li a.is-active-toc {
      color: var(--accent);
      transform: translateX(4px);
    }
    .toc-num {
      color: var(--accent);
      font-weight: 700;
    }

    html {
      scroll-behavior: smooth;
    }
    [id] {
      scroll-margin-top: 100px;
    }

    @media (min-width: 1024px) {
      .toc-mobile-only { display: none !important; }
    }
    @media (max-width: 1023px) {
      .toc-desktop-only { display: none !important; }
    }

    /* Back To Top Button Styling */
    .back-to-top-wrap {
      display: flex;
      justify-content: flex-end;
      margin-top: 3rem;
      border-top: 1px solid var(--line);
      padding-top: 1.5rem;
    }
    .back-to-top-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--text);
      background: var(--panel);
      border: 1px solid var(--line);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .back-to-top-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--bg-2);
    }

    /* Footer Styling */
    .footer {
      border-top: 1px solid var(--line);
      padding: 3rem var(--pad-inline);
      margin-top: 4rem;
      background: var(--bg);
    }
    .footer__inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .footer__logo {
      font-family: var(--font-disp);
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--text);
      letter-spacing: -0.02em;
    }
    .footer__logo em {
      color: var(--accent);
      font-style: normal;
    }
    .footer__copy {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--text-3);
      margin-top: 0.4rem;
    }
    .footer__links {
      display: flex;
      gap: 1.2rem;
      font-family: var(--font-mono);
      font-size: 0.82rem;
    }
    .footer__links a {
      color: var(--text-2);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer__links a:hover {
      color: var(--accent);
    }

    /* Sidebar Styling */
    .article-sidebar { font-family: var(--font-mono); }
    .sidebar-sticky-wrap { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 1.5rem; }
    .sidebar-card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 1.6rem; }
    .sidebar-title { font-size: 0.8rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.2rem; display: block; border-bottom: 1px solid var(--line); padding-bottom: 0.6rem; }
    .sidebar-group { margin-bottom: 1.2rem; }
    .sidebar-label { font-size: 0.72rem; color: var(--text-3); text-transform: uppercase; display: block; margin-bottom: 0.3rem; }
    .sidebar-value { font-size: 0.9rem; color: var(--text); font-weight: 500; }
    .sidebar-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .sidebar-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.85rem; padding: 0.75rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 700; width: 100%; margin-top: 0.8rem; transition: background 0.2s; }
    .btn-github { background: var(--bg-2); border: 1px solid var(--line); color: var(--text); }
    .btn-github:hover { border-color: var(--text-2); }

    @media (min-width: 1024px) {
      .article-wrap { grid-template-columns: 1fr 320px; }
    }
  </style>
</head>
<body class="is-loaded">
  <a href="#mainContent" class="skip-link">Skip to main content</a>
  <div class="grain" aria-hidden="true"></div>

  <!-- ============ HEADER ============ -->
  <header class="site-head" id="siteHead">
    <a class="head__logo" href="/">ANIKET<em>.</em></a>
    <nav class="head__nav" aria-label="Primary">
      <a href="/#profile"><span class="n">01</span>PROFILE</a>
      <a href="/#experience"><span class="n">02</span>EXPERIENCE</a>
      <a href="/#work"><span class="n">03</span>PROJECTS</a>
      <a href="/#stack"><span class="n">04</span>TECH STACK</a>
      <a href="/#certifications"><span class="n">05</span>CERTIFICATIONS</a>
      <a href="/blog/" class="is-active"><span class="n">06</span>BLOG</a>
      <a href="/contact"><span class="n">07</span>CONTACT</a>
    </nav>
    <div class="head__right">
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </header>

  <!-- ============ MOBILE MENU ============ -->
  <div class="menu" id="menu" aria-hidden="true">
    <nav class="menu__nav" aria-label="Mobile">
      <a href="/#profile" class="menu__link"><span>01</span>PROFILE</a>
      <a href="/#experience" class="menu__link"><span>02</span>EXPERIENCE</a>
      <a href="/#work" class="menu__link"><span>03</span>PROJECTS</a>
      <a href="/#stack" class="menu__link"><span>04</span>TECH STACK</a>
      <a href="/#certifications" class="menu__link"><span>05</span>CERTIFICATIONS</a>
      <a href="/blog/" class="menu__link is-active"><span>06</span>BLOG</a>
      <a href="/contact" class="menu__link"><span>07</span>CONTACT</a>
    </nav>
  </div>

  <main id="mainContent">
    <article class="article-wrap">
      <div class="article-main">
        <header class="article-header">
          <div class="article-meta-top">
            <span>${post.category}</span>
            <span>&bull;</span>
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <span>&bull;</span>
            <span>${post.readingTime} min read</span>
          </div>
          <h1 class="article-h1">${post.title}</h1>
          <p class="article-subtitle">${post.description}</p>
        </header>

        <div class="article-body">
${post.htmlContent}
          <div class="back-to-top-wrap">
            <button class="back-to-top-btn" id="backToTop" aria-label="Back to top">
              &uarr; Back to top
            </button>
          </div>
        </div>
      </div>

      <aside class="article-sidebar">
        <div class="sidebar-sticky-wrap">
          <!-- TABLE OF CONTENTS (DESKTOP) -->
          <div class="sidebar-card toc-desktop-only">
            <span class="sidebar-title">Table of Contents</span>
            <ul class="toc-list">
              <li><a href="#overview"><span class="toc-num">00</span> Introduction</a></li>
              <li><a href="#finding-the-data"><span class="toc-num">01</span> Finding the Data</a></li>
              <li><a href="#architecture"><span class="toc-num">02</span> Extension Architecture</a></li>
              <li><a href="#privacy"><span class="toc-num">03</span> Handling Edge Cases</a></li>
              <li><a href="#demo-video"><span class="toc-num">04</span> Demo Video</a></li>
              <li><a href="#source-code"><span class="toc-num">05</span> Source Code</a></li>
            </ul>
          </div>
        </div>
      </aside>
    </article>
  </main>

  <!-- ============ FOOTER ============ -->
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <span class="footer__logo">ANIKET<em>.</em></span>
      </div>
      <div class="footer__links">
        <a href="https://github.com/AniketK100" target="_blank" rel="noopener">GitHub</a>
        <a href="https://x.com/Anik3t_kakad" target="_blank" rel="noopener">X / Twitter</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Back to top scroll
      const btn = document.getElementById('backToTop');
      if (btn) {
        btn.addEventListener('click', function() {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // Active TOC Scroll Highlighting & Smooth Click Handling
      const sections = document.querySelectorAll('h2[id], #overview');
      const tocLinks = document.querySelectorAll('.toc-list a');

      if (tocLinks.length) {
        tocLinks.forEach(link => {
          link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
              const targetEl = document.querySelector(targetId);
              if (targetEl) {
                e.preventDefault();
                const headerOffset = 100;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
                if (history.pushState) {
                  history.pushState(null, null, targetId);
                }
              }
            }
          });
        });
      }

      if (sections.length && tocLinks.length) {
        function updateActiveToc() {
          let current = '';
          const scrollPos = window.scrollY + 120;

          sections.forEach(section => {
            if (scrollPos >= section.offsetTop) {
              current = section.getAttribute('id');
            }
          });

          // Special handling for bottom of the page (Section 05 / Source Code)
          const isAtBottom = (window.innerHeight + Math.ceil(window.scrollY)) >= (document.documentElement.scrollHeight - 60);
          if (isAtBottom && sections.length > 0) {
            current = sections[sections.length - 1].getAttribute('id');
          }

          tocLinks.forEach(link => {
            link.classList.remove('is-active-toc');
            if (link.getAttribute('href') === '#' + current) {
              link.classList.add('is-active-toc');
            }
          });
        }

        window.addEventListener('scroll', updateActiveToc);
        updateActiveToc();
      }
    });
  </script>

  <script src="/js/analytics.js" defer></script>
  <script src="/js/main.js" defer></script>
</body>
</html>`;

    fs.writeFileSync(path.join(postOutputDir, 'index.html'), postHtml, 'utf8');
    console.log(`✓ Generated /blog/${post.slug}/index.html`);
  });

  // 3. UPDATE sitemap.xml
  const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
  const sitemapUrls = [
    'https://anik3t.vercel.app/',
    'https://anik3t.vercel.app/about',
    'https://anik3t.vercel.app/contact',
    'https://anik3t.vercel.app/privacy',
    'https://anik3t.vercel.app/blog/',
    ...posts.map(p => `https://anik3t.vercel.app/blog/${p.slug}/`)
  ];

  const todayDate = '2026-08-29';
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${todayDate}</lastmod>
    <changefreq>${url.includes('/blog/') && url.endsWith('/blog/') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${url === 'https://anik3t.vercel.app/' ? '1.0' : url.includes('/privacy') ? '0.3' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log('✓ Updated sitemap.xml');

  console.log('\n=== BLOG BUILD COMPLETED SUCCESSFULLY ===');
}

buildBlog();
