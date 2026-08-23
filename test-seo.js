const fs = require('fs');
const path = require('path');

function validateHtmlPage(filePath, expected) {
  const html = fs.readFileSync(filePath, 'utf8');

  // 1. Length check (minimum 500 characters)
  if (html.length < 500) {
    throw new Error(`Page ${filePath} is less than 500 characters! Length: ${html.length}`);
  }

  // 2. Canonical tag check
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canonicalMatch || canonicalMatch[1] !== expected.canonical) {
    throw new Error(`Canonical tag mismatch on ${filePath}! Expected "${expected.canonical}", got "${canonicalMatch ? canonicalMatch[1] : 'NONE'}"`);
  }

  // 3. Describedby link check
  const describedbyMatch = html.match(/<link\s+rel="describedby"\s+href="\/llms\.txt"/i);
  if (!describedbyMatch) {
    throw new Error(`rel="describedby" link missing on ${filePath}!`);
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
  if (!robotsMatch || !robotsMatch[1].includes('index')) {
    throw new Error(`Robots meta tag missing or set to noindex on ${filePath}!`);
  }

  // 7. H1 tag check
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) {
    throw new Error(`H1 tag missing on ${filePath}!`);
  }

  // 8. JSON-LD validation
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
  const targetEntity = graph.find(item => item['@type'] === expected.schemaType);
  if (!targetEntity) {
    throw new Error(`Schema type "${expected.schemaType}" missing in JSON-LD on ${filePath}!`);
  }

  console.log(`✓ ${expected.name} page verified (${filePath})`);
  console.log(`  - Title: "${titleMatch[1]}"`);
  console.log(`  - Canonical: "${canonicalMatch[1]}"`);
  console.log(`  - H1: "${h1Match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')}"`);
  console.log(`  - Schema Type: "${expected.schemaType}"`);
  console.log(`  - Describedby Link: Present`);
}

function validateLlmsTxt() {
  const llmsPath = path.join(__dirname, 'llms.txt');
  if (!fs.existsSync(llmsPath)) {
    throw new Error('llms.txt file does not exist at root!');
  }

  const content = fs.readFileSync(llmsPath, 'utf8');

  // Check valid UTF-8
  if (Buffer.from(content).toString('utf8') !== content) {
    throw new Error('llms.txt is not valid UTF-8 text!');
  }

  // First non-empty heading check
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines[0] !== '# Aniket Kakad') {
    throw new Error(`First non-empty heading in llms.txt must be "# Aniket Kakad". Got: "${lines[0]}"`);
  }

  // Summary blockquote check
  if (!content.includes('>')) {
    throw new Error('llms.txt missing blockquote summary!');
  }

  // Required H2 sections
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

  // Required URLs check
  const requiredUrls = [
    'https://anik3t.vercel.app/',
    'https://github.com/AniketK100',
    'https://x.com/Anik3t_kakad',
    'https://anik3t.vercel.app/about',
    'https://anik3t.vercel.app/contact'
  ];
  requiredUrls.forEach(url => {
    if (!content.includes(url)) {
      throw new Error(`llms.txt missing required URL: "${url}"`);
    }
  });

  // Forbidden checks
  if (content.toLowerCase().includes('linkedin')) {
    throw new Error('llms.txt must NOT contain LinkedIn!');
  }

  if (content.toLowerCase().includes('mcp') || content.toLowerCase().includes('model context protocol')) {
    throw new Error('llms.txt must NOT contain invented MCP resources!');
  }

  console.log('✓ llms.txt verified cleanly');
  console.log('  - Heading: # Aniket Kakad');
  console.log('  - Blockquote Summary: Present');
  console.log('  - Required H2 Sections: All 3 Present');
  console.log('  - Official URLs: Homepage, GitHub, X, About, Contact Present');
  console.log('  - LinkedIn Check: Absent');
}

function runAllSeoTests() {
  console.log('=== RUNNING COMPREHENSIVE ROUTE, SEO & LLMS.TXT TEST SUITE ===\n');

  // 1. Validate llms.txt
  validateLlmsTxt();
  console.log('');

  // 2. Validate Homepage
  validateHtmlPage(path.join(__dirname, 'index.html'), {
    name: 'Homepage',
    title: 'Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/',
    schemaType: 'Person'
  });

  // 3. Validate About Page
  validateHtmlPage(path.join(__dirname, 'about', 'index.html'), {
    name: 'About',
    title: 'About Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/about',
    schemaType: 'AboutPage'
  });

  // 4. Validate Contact Page
  validateHtmlPage(path.join(__dirname, 'contact', 'index.html'), {
    name: 'Contact',
    title: 'Contact Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/contact',
    schemaType: 'ContactPage'
  });

  // 5. Validate Privacy Page
  validateHtmlPage(path.join(__dirname, 'privacy', 'index.html'), {
    name: 'Privacy',
    title: 'Privacy Policy — Aniket Kakad',
    canonical: 'https://anik3t.vercel.app/privacy',
    schemaType: 'WebPage'
  });

  console.log('\n=== ALL ROUTE, SEO & LLMS.TXT CHECKS PASSED SUCCESSFULLY ===');
}

runAllSeoTests();
