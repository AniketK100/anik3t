const fs = require('fs');
const path = require('path');

function runSeoValidation() {
  const htmlPath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  console.log('--- STARTING SEO & ENTITY VALIDATION ---');

  // 1. Check Canonical Link
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canonicalMatch || canonicalMatch[1] !== 'https://anik3t.vercel.app/') {
    throw new Error(`Canonical tag missing or invalid: ${canonicalMatch ? canonicalMatch[1] : 'NONE'}`);
  }
  console.log('✓ Canonical Tag verified:', canonicalMatch[1]);

  // 2. Check Robots Meta Tag
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
  if (!robotsMatch || !robotsMatch[1].includes('index')) {
    throw new Error(`Robots meta tag missing or set to noindex: ${robotsMatch ? robotsMatch[1] : 'NONE'}`);
  }
  console.log('✓ Robots Meta Tag verified:', robotsMatch[1]);

  // 3. Check OpenGraph Tags
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i);
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (!ogTitle || !ogUrl || !ogImage) {
    throw new Error('OpenGraph metadata (title, url, or image) missing!');
  }
  console.log('✓ OpenGraph Metadata verified:', { title: ogTitle[1], url: ogUrl[1], image: ogImage[1] });

  // 4. Extract and Validate JSON-LD
  const jsonLdMatch = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (!jsonLdMatch) {
    throw new Error('JSON-LD script tag not found in index.html!');
  }

  let parsedJsonLd;
  try {
    parsedJsonLd = JSON.parse(jsonLdMatch[1]);
  } catch (err) {
    throw new Error(`JSON-LD syntax error: ${err.message}`);
  }
  console.log('✓ JSON-LD syntax is valid JSON');

  const graph = parsedJsonLd['@graph'] || [parsedJsonLd];
  const personEntities = graph.filter(item => item['@type'] === 'Person');

  if (personEntities.length === 0) {
    throw new Error('No Person entity found in JSON-LD!');
  }
  if (personEntities.length > 1) {
    throw new Error(`Duplicate conflicting Person entities found: ${personEntities.length}`);
  }

  const person = personEntities[0];

  if (person.name !== 'Aniket Kakad') {
    throw new Error(`Person name mismatch! Expected "Aniket Kakad", got "${person.name}"`);
  }
  console.log('✓ Person name is exactly "Aniket Kakad"');

  if (person.url !== 'https://anik3t.vercel.app/') {
    throw new Error(`Person URL mismatch! Expected "https://anik3t.vercel.app/", got "${person.url}"`);
  }
  console.log('✓ Person URL is the canonical homepage');

  if (person['@id'] !== 'https://anik3t.vercel.app/#person') {
    throw new Error(`Person @id mismatch! Expected "https://anik3t.vercel.app/#person", got "${person['@id']}"`);
  }
  console.log('✓ Person @id is stable:', person['@id']);

  const websiteEntities = graph.filter(item => item['@type'] === 'WebSite');
  if (websiteEntities.length === 1) {
    const website = websiteEntities[0];
    if (website['@id'] !== 'https://anik3t.vercel.app/#website') {
      throw new Error(`WebSite @id mismatch! Expected "https://anik3t.vercel.app/#website", got "${website['@id']}"`);
    }
    console.log('✓ WebSite entity verified:', website['@id']);
  }

  console.log('--- ALL SEO & ENTITY VALIDATION CHECKS PASSED SUCCESSFULLY ---');
}

runSeoValidation();
