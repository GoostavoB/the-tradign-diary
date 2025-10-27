/**
 * AST-based translation validator - catches duplicate keys at ANY depth
 * Run with: node scripts/validate-translations.js
 */
const fs = require('fs');
const path = require('path');
const parse = require('json-to-ast');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const LANGUAGES = ['en', 'pt', 'es', 'ar', 'vi'];

const criticalKeys = [
  'landing.hero.titleShort',
  'landing.hero.benefits',
  'landing.hero.ctaPrimary',
  'landing.proofBar.activeTraders',
  'landing.proofBar.tradesAnalyzed',
  'landing.proofBar.averageRating',
  'landing.testimonials.sectionTitle',
  'landing.footer.securityBadge',
  'landing.benefits.mainTitle',
  'landing.benefits.ctaButton',
  'landing.benefits.fasterUploads.title',
  'landing.benefits.fasterUploads.description',
  'landing.benefits.uploadGo.title',
  'landing.benefits.uploadGo.description',
  'navigation.contact',
  'navigation.signIn',
  'navigation.home',
  'navigation.dashboard',
  'blog.title',
  'blog.searchPlaceholder',
  'pricing.title',
  'contact.title',
  'contact.subtitle',
  'common.save',
  'common.cancel',
  'common.loading'
];

let hasErrors = false;

/**
 * Recursively find duplicate keys in AST object nodes
 */
function findDuplicateKeys(node, path = []) {
  const duplicates = [];
  
  if (node.type === 'Object') {
    const keysSeen = new Map();
    
    for (const property of node.children) {
      const keyName = property.key.value;
      const fullPath = [...path, keyName].join('.');
      
      if (keysSeen.has(keyName)) {
        duplicates.push({
          key: keyName,
          path: fullPath,
          line: property.loc.start.line
        });
      } else {
        keysSeen.set(keyName, true);
      }
      
      // Recursively check nested objects
      const nestedDuplicates = findDuplicateKeys(property.value, [...path, keyName]);
      duplicates.push(...nestedDuplicates);
    }
  }
  
  return duplicates;
}

/**
 * Get value at nested key path
 */
function getNestedValue(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || !current[key]) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

LANGUAGES.forEach(lang => {
  const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
  
  console.log(`\n🔍 Validating ${lang}/translation.json...`);
  
  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse to AST to detect duplicates (preserves duplicate keys)
    let ast;
    try {
      ast = parse(rawContent, { loc: true });
    } catch (parseError) {
      console.error(`❌ JSON PARSE ERROR: ${parseError.message}`);
      hasErrors = true;
      return;
    }
    
    // Find duplicate keys at any depth
    const duplicates = findDuplicateKeys(ast);
    
    if (duplicates.length > 0) {
      console.error(`❌ DUPLICATE KEYS FOUND:`);
      duplicates.forEach(dup => {
        console.error(`   - "${dup.key}" at path "${dup.path}" (line ${dup.line})`);
      });
      hasErrors = true;
    }
    
    // Parse JSON normally for critical key checks
    const translations = JSON.parse(rawContent);
    
    criticalKeys.forEach(keyPath => {
      const value = getNestedValue(translations, keyPath);
      
      if (value === undefined) {
        console.error(`❌ MISSING CRITICAL KEY: ${keyPath}`);
        hasErrors = true;
      }
    });
    
    if (!hasErrors || duplicates.length === 0) {
      console.log(`✅ ${lang} validation passed`);
    }
    
  } catch (error) {
    console.error(`❌ ERROR reading ${lang}:`, error.message);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\n❌ Translation validation FAILED');
  console.error('\n💡 Fix all duplicate keys and missing critical keys before proceeding.');
  process.exit(1);
} else {
  console.log('\n✅ All translations validated successfully');
  process.exit(0);
}
