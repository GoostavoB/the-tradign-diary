# Translation Guidelines

## Critical Rules

### 🚫 Never Create Duplicate Top-Level Keys
The most common cause of translation issues is duplicate top-level keys in `translation.json` files (e.g., two `\"landing\"` objects). This causes the second definition to overwrite the first, losing all keys from the first definition.

**Always check for duplicates before committing!**

### ✅ Always Run Validation Before Committing
```bash
npm run validate-translations
```

### 🛡️ Always Add Fallback Strings
For all user-facing text, use fallback strings to prevent raw keys from displaying:

```typescript
// ❌ BAD - Shows raw key if translation missing
{t('landing.hero.title')}

// ✅ GOOD - Shows fallback if translation missing
{t('landing.hero.title', 'Track every crypto trade. Learn faster.')}
```

### 🌍 Always Test in All 5 Languages
Before deploying, verify your changes work in:
- English (`/`)
- Portuguese (`/pt`)
- Spanish (`/es`)
- Arabic (`/ar`)
- Vietnamese (`/vi`)

## Project Structure

### Translation Files
```
src/locales/
├── en/translation.json  # English (default)
├── pt/translation.json  # Portuguese
├── es/translation.json  # Spanish
├── ar/translation.json  # Arabic (RTL)
└── vi/translation.json  # Vietnamese
```

### Key Organization
Translation keys are organized by feature/section:
- `common.*` - Shared UI elements (buttons, labels, etc.)
- `landing.*` - Landing page content
- `navigation.*` - Navigation menus and links
- `blog.*` - Blog-related content
- `pricing.*` - Pricing page content
- `contact.*` - Contact form content
- `dashboard.*` - Dashboard elements
- `journal.*` - Trading journal features
- etc.

## Adding New Translation Keys

### Step 1: Add to English First
Always start with `src/locales/en/translation.json`:

```json
{
  "common": {
    "newFeature": "My New Feature"
  }
}
```

### Step 2: Add to All Other Languages
Add the same key path to:
- `src/locales/pt/translation.json`
- `src/locales/es/translation.json`
- `src/locales/ar/translation.json`
- `src/locales/vi/translation.json`

**Use proper translations, not just English text!**

### Step 3: If It's Critical, Add to Validation
If the key is essential for app functionality, add it to the critical keys list in:
- `src/i18n.ts` (line ~66)
- `scripts/validate-translations.js` (line ~10)

### Step 4: Run Validation
```bash
npm run validate-translations
```

### Step 5: Use with Fallback in Components
```typescript
const { t } = useTranslation();

// Use the new key with a fallback
<h1>{t('common.newFeature', 'My New Feature')}</h1>
```

## Debugging Translation Issues

### Issue: Raw Keys Showing (e.g., \"landing.hero.title\")

**Causes:**
1. Duplicate top-level keys in translation files
2. Missing translation key
3. Translation not loaded yet

**Solutions:**
1. Check for duplicate keys: `npm run validate-translations`
2. Verify key exists in all language files
3. Add fallback string in component: `t('key', 'Fallback')`

### Issue: Page Stuck on \"Loading...\"

**Causes:**
1. Translation loading timeout
2. Invalid JSON in translation file
3. Language switching loop

**Solutions:**
1. Check browser console for errors
2. Validate JSON syntax: `npm run validate-translations`
3. Verify `LanguageSync` component is not creating loops

### Issue: Language Switching Doesn't Work

**Causes:**
1. URL not updating
2. Translation not found for new language
3. Language context not syncing

**Solutions:**
1. Check `LanguageContext` timeout protection (3 seconds max)
2. Verify translation exists in target language
3. Check console for language sync logs

## Development Workflow

### Before Starting Work
```bash
# Pull latest translations
git pull origin main

# Verify no existing issues
npm run validate-translations
```

### During Development
1. Add English translations first
2. Test in English (`/`)
3. Add translations for other languages
4. Test in all languages
5. Run validation script

### Before Committing
```bash
# Final validation
npm run validate-translations

# If it passes, commit
git add .
git commit -m "feat: add new feature with translations"
```

## Translation Best Practices

### For Developers

1. **Keep Keys Descriptive**
   ```json
   // ❌ BAD
   "text1": "Save"
   
   // ✅ GOOD
   "common.save": "Save"
   ```

2. **Use Nested Structure**
   ```json
   // ❌ BAD
   "landing_hero_title": "Title"
   
   // ✅ GOOD
   "landing": {
     "hero": {
       "title": "Title"
     }
   }
   ```

3. **Always Provide Context**
   ```typescript
   // Add comment for translators
   // Translation: Button label for saving user settings
   {t('common.save')}
   ```

### For Translators

1. **Maintain Tone and Style**
   - Keep the friendly, professional tone
   - Use trading-specific terminology correctly
   - Match formality level of English version

2. **Consider Character Limits**
   - Some UI elements have space constraints
   - Test translations in actual UI
   - Abbreviate if necessary, but keep meaning

3. **Preserve Placeholders**
   ```json
   // English
   "greeting": "Hello, {{name}}!"
   
   // Spanish - Keep {{name}} placeholder
   "greeting": "¡Hola, {{name}}!"
   ```

4. **Handle Pluralization**
   ```json
   {
     "trades": "{{count}} trade",
     "trades_plural": "{{count}} trades"
   }
   ```

## Validation Script

The validation script (`scripts/validate-translations.js`) checks for:

✅ Duplicate top-level keys  
✅ Missing critical translation keys  
✅ Valid JSON syntax  
✅ Consistent structure across languages  

Run it with:
```bash
npm run validate-translations
```

## Troubleshooting Commands

```bash
# Check for duplicate keys in a file
grep -o '\"[^\"]*\":\s*{' src/locales/en/translation.json | sort | uniq -d

# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('src/locales/en/translation.json'))"

# Count keys in each language
for lang in en pt es ar vi; do
  echo "$lang: $(grep -o '\"[^\"]*\":' src/locales/$lang/translation.json | wc -l) keys"
done
```

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [React i18next Guide](https://react.i18next.com/)
- Project translation files: `src/locales/`
- Validation script: `scripts/validate-translations.js`

## Getting Help

If you encounter translation issues:

1. Check this guide first
2. Run `npm run validate-translations`
3. Check browser console for errors
4. Review recent commits that touched translation files
5. Ask the team in #development channel

---

**Remember:** Good translations make for a great user experience. Take the time to do it right! 🌍
