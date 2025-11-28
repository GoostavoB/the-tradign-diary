/**
 * Validates translation files for duplicate keys and critical missing keys
 * Run with: node scripts/validate-translations.js
 */
const fs = require('fs');
const path = require('path');

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

LANGUAGES.forEach(lang => {
  const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
  
  console.log(`\n🔍 Validating ${lang}/translation.json...`);
  
  try {
    // Read raw file content
    const rawContent = fs.readFileSync(filePath, 'utf8');
    
    // Check for duplicate top-level keys using regex
    const topLevelKeys = rawContent.match(/"(\w+)":\s*{/g);
    if (topLevelKeys) {
      const keyNames = topLevelKeys.map(k => k.match(/"(\w+)"/)[1]);
      const duplicates = keyNames.filter((key, i) => keyNames.indexOf(key) !== i);
      
      if (duplicates.length > 0) {
        console.error(`❌ DUPLICATE TOP-LEVEL KEYS FOUND: ${[...new Set(duplicates)].join(', ')}`);
        hasErrors = true;
      }
    }
    
    // Parse and check for critical keys
    const translations = JSON.parse(rawContent);
    
    criticalKeys.forEach(keyPath => {
      const keys = keyPath.split('.');
      let current = translations;
      
      for (const key of keys) {
        if (!current || !current[key]) {
          console.error(`❌ MISSING CRITICAL KEY: ${keyPath}`);
          hasErrors = true;
          break;
        }
        current = current[key];
      }
    });
    
    if (!hasErrors) {
      console.log(`✅ ${lang} validation passed`);
    }
    
  } catch (error) {
    console.error(`❌ ERROR reading ${lang}:`, error.message);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\n❌ Translation validation FAILED');
  process.exit(1);
} else {
  console.log('\n✅ All translations validated successfully');
  process.exit(0);
}
