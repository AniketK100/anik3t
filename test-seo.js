const fs = require('fs');
const path = require('path');
const http = require('http');

function validateHtmlPage(filePath, expected) {
  const html = fs.readFileSync(filePath, 'utf8');

  // Length check (minimum 500 characters)
  if (html.length < 500) {
    throw new Error(`Page ${filePath} is less than 500 characters! Length: ${html.length}`);
  }

  // Canonical tag check
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canonicalMatch || canonicalMatch[1] !== expected.canonical) {
    throw new Error(`Canonical tag mismatch on ${filePath}! Expected "${expected.canonical}", got "${canonicalMatch ? canonicalMatch[1] : 'NONE'}"`);
  }

  // Title tag check
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || titleMatch[1] !== expected.title) {
    throw new Error(`Title mismatch on ${filePath}! Expected "${expected.title}", got "${titleMatch ? titleMatch[1] : 'NONE'}"`);
  }

  // Meta description check
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (!descMatch || !descMatch[1]) {
    throw new Error(`Meta description missing on ${filePath}!`);
  }

  // Robots meta check
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
  if (!robotsMatch || !robotsMatch[1].includes('index')) {
    throw new Error(`Robots meta tag missing or set to noindex on ${filePath}!`);
  }

  // H1 tag check
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) {
    throw new Error(`H1 tag missing on ${filePath}!`);
  }

  // JSON-LD validation
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
}

function runAllSeoTests() {
  console.log('=== RUNNING COMPREHENSIVE ROUTE & SEO TEST SUITE ===\n');

  // 1. Validate Homepage
  validateHtmlPage(path.join(__dirname, 'index.html'), {
    name: 'Homepage',
    title: 'Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/',
    schemaType: 'Person'
  });

  // 2. Validate About Page
  validateHtmlPage(path.join(__dirname, 'about', 'index.html'), {
    name: 'About',
    title: 'About Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/about',
    schemaType: 'AboutPage'
  });

  // 3. Validate Contact Page
  validateHtmlPage(path.join(__dirname, 'contact', 'index.html'), {
    name: 'Contact',
    title: 'Contact Aniket Kakad — Full-Stack Developer',
    canonical: 'https://anik3t.vercel.app/contact',
    schemaType: 'ContactPage'
  });

  // 4. Validate Privacy Page
  validateHtmlPage(path.join(__dirname, 'privacy', 'index.html'), {
    name: 'Privacy',
    title: 'Privacy Policy — Aniket Kakad',
    canonical: 'https://anik3t.vercel.app/privacy',
    schemaType: 'WebPage'
  });

  console.log('\n=== ALL ROUTE & SEO CHECKS PASSED SUCCESSFULLY ===');
}

runAllSeoTests();
