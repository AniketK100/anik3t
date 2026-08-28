const fs = require('fs');
const path = require('path');

function validateHtmlPage(filePath, expected) {
  const html = fs.readFileSync(filePath, 'utf8');

  // 1. Length check (minimum 500 characters)
  if (html.length < 500) {
    throw new Error(`Page ${filePath} is less than 500 characters! Length: ${html.length}`);
  }

  // 2. Canonical tag check (if required)
  if (expected.canonical) {
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    if (!canonicalMatch || canonicalMatch[1] !== expected.canonical) {
      throw new Error(`Canonical tag mismatch on ${filePath}! Expected "${expected.canonical}", got "${canonicalMatch ? canonicalMatch[1] : 'NONE'}"`);
    }
  }

  // 3. Describedby link check
  const describedbyMatch = html.match(/<link\s+rel="describedby"\s+href="\/llms\.txt"/i);
  if (!describedbyMatch) {
    throw new Error(`rel="describedby" link missing on ${filePath}!`);
  }

  // 3b. Google Analytics Tag (gtag.js) check - must exist exactly once
  const gtagMatches = html.match(/googletagmanager\.com\/gtag\/js\?id=G-SVP8YVB8R1/g);
  if (!gtagMatches || gtagMatches.length !== 1) {
    throw new Error(`Google Analytics tag G-SVP8YVB8R1 missing or duplicated on ${filePath}! Found count: ${gtagMatches ? gtagMatches.length : 0}`);
  }

  // 4. Title tag check
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || titleMatch[1] !== expected.title) {
    throw new Error(`Title mismatch on ${filePath}! Expected "${expected.title}", got "${titleMatch ? titleMatch[1] : 'NONE'}"`);
  }

  // 5. Meta description check
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (!descMatch || !descMatch[1]) {
    throw new Error(`Meta description missing on ${filePath}!`);
  }

  // 6. Robots meta check
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
  if (!robotsMatch || !robotsMatch[1].includes(expected.robotsExpect || 'index')) {
    throw new Error(`Robots meta tag mismatch on ${filePath}! Expected to include "${expected.robotsExpect || 'index'}", got "${robotsMatch ? robotsMatch[1] : 'NONE'}"`);
  }

  // 7. H1 tag check
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) {
    throw new Error(`H1 tag missing on ${filePath}!`);
  }

  // 7b. OpenGraph & Twitter entity checks (og:site_name, twitter:creator, absolute og:image)
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i);
  if (!ogSiteName || ogSiteName[1] !== 'Aniket Kakad') {
    throw new Error(`og:site_name missing or incorrect on ${filePath}! Expected "Aniket Kakad"`);
  }

  const twitterCreator = html.match(/<meta\s+name="twitter:creator"\s+content="([^"]+)"/i);
  if (!twitterCreator || twitterCreator[1] !== '@Anik3t_kakad') {
    throw new Error(`twitter:creator missing or incorrect on ${filePath}! Expected "@Anik3t_kakad"`);
  }

  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (!ogImage || !ogImage[1].startsWith('https://')) {
    throw new Error(`og:image missing or not an absolute HTTPS URL on ${filePath}! Got "${ogImage ? ogImage[1] : 'NONE'}"`);
  }

  // 8. JSON-LD validation (if required)
  if (expected.schemaType) {
    const jsonLdMatch = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    if (!jsonLdMatch) {
      throw new Error(`JSON-LD script tag missing on ${filePath}!`);
    }

    let parsedJsonLd;
    try {
      parsedJsonLd = JSON.parse(jsonLdMatch[1]);
    } catch (e) {
      throw new Error(`JSON-LD syntax error on ${filePath}: ${e.message}`);
    }

    const graph = parsedJsonLd['@graph'] || [parsedJsonLd];

    // Verify main target entity
    const targetEntity = graph.find(item => {
      const type = item['@type'];
      return Array.isArray(type) ? type.includes(expected.schemaType) : type === expected.schemaType;
    });

    if (!targetEntity) {
      throw new Error(`Schema type "${expected.schemaType}" missing in JSON-LD on ${filePath}!`);
    }

    // Special verification for About page ProfilePage & Person graph
    if (expected.schemaType === 'ProfilePage') {
      if (targetEntity.url !== 'https://anik3t.vercel.app/about') {
        throw new Error(`ProfilePage url mismatch on ${filePath}! Expected "https://anik3t.vercel.app/about", got "${targetEntity.url}"`);
      }

      if (!targetEntity.mainEntity || targetEntity.mainEntity['@id'] !== 'https://anik3t.vercel.app/#person') {
        throw new Error(`ProfilePage mainEntity @id mismatch on ${filePath}! Expected "https://anik3t.vercel.app/#person"`);
      }

      // Check exactly one Person entity exists in graph
      const personEntities = graph.filter(item => item['@type'] === 'Person');
      if (personEntities.length !== 1) {
        throw new Error(`Expected exactly 1 Person entity in graph on ${filePath}, found ${personEntities.length}!`);
      }

      const person = personEntities[0];
      if (person['@id'] !== 'https://anik3t.vercel.app/#person') {
        throw new Error(`Person @id mismatch on ${filePath}! Expected "https://anik3t.vercel.app/#person", got "${person['@id']}"`);
      }

      if (person.name !== 'Aniket Kakad') {
        throw new Error(`Person name mismatch on ${filePath}! Expected "Aniket Kakad", got "${person.name}"`);
      }

      if (person.url !== 'https://anik3t.vercel.app/') {
        throw new Error(`Person url mismatch on ${filePath}! Expected "https://anik3t.vercel.app/", got "${person.url}"`);
      }

      const approvedSameAs = [
        'https://github.com/AniketK100',
        'https://x.com/Anik3t_kakad'
      ];
      if (!Array.isArray(person.sameAs) || JSON.stringify(person.sameAs.sort()) !== JSON.stringify(approvedSameAs.sort())) {
        throw new Error(`Person sameAs mismatch on ${filePath}! Expected approved profiles, got ${JSON.stringify(person.sameAs)}`);
      }

      if (JSON.stringify(person).toLowerCase().includes('linkedin')) {
        throw new Error(`LinkedIn must NOT be present in Person entity on ${filePath}!`);
      }

      if (!Array.isArray(person.alternateName) || !person.alternateName.includes('Anik3t')) {
        throw new Error(`Person alternateName missing or invalid on ${filePath}! Got: ${JSON.stringify(person.alternateName)}`);
      }
    }

    // Special verification for Homepage Person entity
    if (expected.schemaType === 'Person') {
      const personEntities = graph.filter(item => item['@type'] === 'Person');
      if (personEntities.length !== 1) {
        throw new Error(`Expected exactly 1 Person entity in graph on ${filePath}, found ${personEntities.length}!`);
      }
      const person = personEntities[0];
      if (!Array.isArray(person.alternateName) || !person.alternateName.includes('Anik3t')) {
        throw new Error(`Person alternateName missing on homepage! Got: ${JSON.stringify(person.alternateName)}`);
      }
    }
  }

  console.log(`✓ ${expected.name} page verified (${filePath})`);
  console.log(`  - Title: "${titleMatch[1]}"`);
  if (expected.canonical) console.log(`  - Canonical: "${expected.canonical}"`);
  console.log(`  - H1: "${h1Match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')}"`);
  if (expected.schemaType) console.log(`  - Schema Type: "${expected.schemaType}"`);
  console.log(`  - Describedby Link: Present`);
}

function validate404Page() {
  const path404 = path.join(__dirname, '404.html');
  if (!fs.existsSync(path404)) {
    throw new Error('404.html does not exist in root directory!');
  }

  const content = fs.readFileSync(path404, 'utf8');

  if (!content.toLowerCase().includes('not found')) {
    throw new Error('404.html does not contain "not found" text!');
  }

  const requiredRecoveryLinks = [
    '/llms.txt',
    '/sitemap.xml',
    '/about',
    '/blog/',
    '/contact',
    'https://anik3t.vercel.app/'
  ];

  requiredRecoveryLinks.forEach(link => {
    if (!content.includes(link)) {
      throw new Error(`404.html recovery links missing required link: "${link}"`);
    }
  });

  if (!content.includes('noindex')) {
    throw new Error('404.html must contain noindex robots tag!');
  }

  const gtagMatches = content.match(/googletagmanager\.com\/gtag\/js\?id=G-SVP8YVB8R1/g);
  if (!gtagMatches || gtagMatches.length !== 1) {
    throw new Error(`Google Analytics tag G-SVP8YVB8R1 missing or duplicated on 404.html! Found count: ${gtagMatches ? gtagMatches.length : 0}`);
  }

  console.log('✓ 404.html verified cleanly');
  console.log('  - Title: 404 — Page Not Found');
  console.log('  - Robots: noindex, follow');
  console.log('  - Recovery links: /llms.txt, /sitemap.xml, /about, /contact, / present');
}

function validateLlmsTxt() {
  const llmsPath = path.join(__dirname, 'llms.txt');
  if (!fs.existsSync(llmsPath)) {
    throw new Error('llms.txt file does not exist at root!');
  }

  const content = fs.readFileSync(llmsPath, 'utf8');

  if (Buffer.from(content).toString('utf8') !== content) {
    throw new Error('llms.txt is not valid UTF-8 text!');
  }

  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines[0] !== '# Aniket Kakad') {
    throw new Error(`First non-empty heading in llms.txt must be "# Aniket Kakad". Got: "${lines[0]}"`);
  }

  if (!content.includes('>')) {
    throw new Error('llms.txt missing blockquote summary!');
  }

  const requiredH2s = [
    '## When to use this site',
    '## Official information',
    '## Official profiles'
  ];
  requiredH2s.forEach(h2 => {
    if (!content.includes(h2)) {
      throw new Error(`llms.txt missing required H2 section: "${h2}"`);
    }
  });

  const requiredUrls = [
    'https://anik3t.vercel.app/',
    'https://github.com/AniketK100',
    'https://x.com/Anik3t_kakad',
    'https://anik3t.vercel.app/about',
    'https://anik3t.vercel.app/blog/',
    'https://anik3t.vercel.app/blog/naukri-exact-applicant-count/',
    'https://anik3t.vercel.app/contact'
  ];
  requiredUrls.forEach(url => {
    if (!content.includes(url)) {
      throw new Error(`llms.txt missing required URL: "${url}"`);
    }
  });

  if (content.toLowerCase().includes('linkedin')) {
    throw new Error('llms.txt must NOT contain LinkedIn!');
  }

  console.log('✓ llms.txt verified cleanly');
}

function validateRobotsTxt() {
  const robotsPath = path.join(__dirname, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    throw new Error('robots.txt does not exist at root!');
  }
  const content = fs.readFileSync(robotsPath, 'utf8');
  if (!content.includes('User-agent: *')) {
    throw new Error('robots.txt missing User-agent: * directive!');
  }
  if (!content.includes('Allow: /')) {
    throw new Error('robots.txt missing Allow: / directive!');
  }
  if (!content.includes('Sitemap: https://anik3t.vercel.app/sitemap.xml')) {
    throw new Error('robots.txt missing Sitemap directive!');
  }
  console.log('✓ robots.txt verified cleanly');
}

function validateSitemapXml() {
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('sitemap.xml does not exist at root!');
  }
  const content = fs.readFileSync(sitemapPath, 'utf8');
  if (!content.includes('<loc>https://anik3t.vercel.app/</loc>')) {
    throw new Error('sitemap.xml missing homepage loc!');
  }
  if (!content.includes('<loc>https://anik3t.vercel.app/privacy</loc>')) {
    throw new Error('sitemap.xml missing privacy loc!');
  }
  console.log('✓ sitemap.xml verified cleanly');
}

function runAllSeoTests() {
  console.log('=== RUNNING COMPREHENSIVE ROUTE, SEO, PROFILEPAGE, LLMS.TXT & 404 TEST SUITE ===\n');

  // 1. Validate llms.txt
  validateLlmsTxt();
  console.log('');

  // 2. Validate robots.txt
  validateRobotsTxt();
  console.log('');

  // 3. Validate sitemap.xml
  validateSitemapXml();
  console.log('');

  // 4. Validate 404 Page
  validate404Page();
  console.log('');

  // 3. Validate Homepage
  validateHtmlPage(path.join(__dirname, 'index.html'), {
    name: 'Homepage',
    title: 'Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/',
    schemaType: 'Person'
  });

  // 4. Validate About Page (ProfilePage & Person Graph)
  validateHtmlPage(path.join(__dirname, 'about', 'index.html'), {
    name: 'About',
    title: 'About Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/about',
    schemaType: 'ProfilePage'
  });

  // 5. Validate Contact Page
  validateHtmlPage(path.join(__dirname, 'contact', 'index.html'), {
    name: 'Contact',
    title: 'Contact Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/contact',
    schemaType: 'ContactPage'
  });

  // 6. Validate Privacy Page
  validateHtmlPage(path.join(__dirname, 'privacy', 'index.html'), {
    name: 'Privacy',
    title: 'Privacy Policy — Aniket Kakad',
    canonical: 'https://anik3t.vercel.app/privacy',
    schemaType: 'WebPage'
  });

  // 7. Validate Blog Index Page
  validateHtmlPage(path.join(__dirname, 'blog', 'index.html'), {
    name: 'Blog Index',
    title: 'Blog — Aniket Kakad | Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/blog/',
    schemaType: 'CollectionPage'
  });

  // 8. Validate Naukri Extension Blog Article Page
  validateHtmlPage(path.join(__dirname, 'blog', 'naukri-exact-applicant-count', 'index.html'), {
    name: 'Naukri Article',
    title: 'Naukri Shows 100+ Applicants. I Wanted the Exact Number. — Aniket Kakad',
    canonical: 'https://anik3t.vercel.app/blog/naukri-exact-applicant-count/',
    schemaType: 'BlogPosting'
  });

  console.log('\n=== ALL ROUTE, SEO, PROFILEPAGE, BLOG, LLMS.TXT & 404 CHECKS PASSED SUCCESSFULLY ===');
}

runAllSeoTests();
