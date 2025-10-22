# Scripts Directory

## 🔧 Available Scripts

### 1. Schema Validation (`validateSchema.ts`)
Validates JSON-LD structured data on all pages to ensure compliance with Schema.org standards.

**Usage:**
```bash
npm run validate-schema
# or
tsx scripts/validateSchema.ts
```

**What it checks:**
- Article Schema (headline, author, datePublished, image)
- Breadcrumb Schema (itemListElement structure)
- Offer Schema (price, availability, priceCurrency)
- Organization Schema
- FAQ Schema

**When to run:**
- Before deploying to production
- After adding new structured data
- During content updates

---

### 2. Dynamic Sitemap Generator (`generateSitemap.ts`)
Automatically generates sitemap.xml with up-to-date blog articles and lastmod dates.

**Setup:**
```bash
# Install tsx if not present
npm install -D tsx

# Add to package.json scripts:
"scripts": {
  "generate-sitemap": "tsx scripts/generateSitemap.ts",
  "build": "npm run generate-sitemap && vite build"
}
```

**Usage:**
```bash
npm run generate-sitemap
```

**What it generates:**
- Main sitemap with all static pages
- Blog article URLs with hreflang alternates
- Language-specific landing pages
- Proper priority and changefreq values
- Current date as lastmod

**When to run:**
- Before each build (automated in build script)
- After adding new blog articles
- After updating article dates
- Monthly for lastmod updates

**Output:**
- File: `public/sitemap.xml`
- Format: XML with proper namespaces
- Includes: ~30+ URLs with multilingual support

---

## 📋 Adding New Scripts

When adding new build scripts:

1. Create TypeScript file in `/scripts/` directory
2. Add shebang: `#!/usr/bin/env node`
3. Use Node.js file system APIs
4. Add error handling and logging
5. Update this README
6. Add to package.json scripts section

---

## 🚀 CI/CD Integration

For automated SEO validation in CI/CD:

```yaml
# Example GitHub Actions
- name: Validate SEO
  run: |
    npm install
    npm run validate-schema
    npm run generate-sitemap
```

---

## 📚 Related Documentation

- **SEO Implementation Summary**: `SEO_IMPLEMENTATION_SUMMARY.md`
- **SEO Monitoring**: `src/utils/seoMonitoring.ts`
- **SEO Validation**: `src/utils/seoValidation.ts`

---

## 🛠️ Maintenance

### Monthly Tasks
- Update blog article data in `generateSitemap.ts`
- Review validation results
- Add new schema types as needed

### Quarterly Tasks
- Audit all structured data
- Update schema to latest standards
- Add new validation rules

---

**Last Updated:** 2025-10-22
