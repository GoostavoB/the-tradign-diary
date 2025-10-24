# Design System Documentation

## Overview

This design system ensures UI/UX consistency across The Trading Diary application. All components should use the centralized design tokens defined in `src/styles/design-tokens.ts`.

## Design Tokens

### Spacing

Use semantic spacing tokens instead of arbitrary Tailwind classes:

```typescript
import { spacing } from '@/styles/design-tokens';

// Section spacing
<div className={spacing.section}>        // space-y-8
<div className={spacing.sectionCompact}> // space-y-6

// Card internal spacing
<div className={spacing.card}>           // space-y-6
<div className={spacing.cardCompact}>    // space-y-4

// Form spacing
<div className={spacing.form}>           // space-y-4

// Inline/horizontal spacing
<div className={spacing.inline}>         // gap-2
<div className={spacing.stack}>          // gap-4
```

### Layout

Predefined layout patterns:

```typescript
import { layout } from '@/styles/design-tokens';

// Page container
<div className={layout.container}>       // container max-w-7xl mx-auto p-6

// Grid layouts
<div className={layout.grid.stats}>      // 4-column responsive grid
<div className={layout.grid.responsive}> // 3-column responsive grid
<div className={layout.grid.twoCol}>     // 2-column grid

// Flex utilities
<div className={layout.flex.between}>    // space-between
<div className={layout.flex.center}>     // centered
```

### Card Styles

Consistent card styling:

```typescript
import { card } from '@/styles/design-tokens';

<Card className={card.base}>            // Standard card
<Card className={card.glass}>           // Glass effect card
<Card className={card.interactive}>     // Hoverable card

// Card padding
<CardContent className={card.padding.default}>  // p-6
<CardContent className={card.padding.compact}>  // p-4
```

### Typography

Semantic typography tokens:

```typescript
import { typography } from '@/styles/design-tokens';

<h1 className={typography.pageTitle}>           // text-3xl font-bold
<p className={typography.pageSubtitle}>         // text-muted-foreground mt-1
<h2 className={typography.sectionTitle}>        // text-2xl font-semibold
<h3 className={typography.cardTitle}>           // text-lg font-semibold
<p className={typography.body}>                 // text-sm text-muted-foreground
```

## Color System

All colors use HSL tokens from `index.css` and `tailwind.config.ts`:

- **Never use**: `text-white`, `bg-white`, `text-black`, `bg-black`
- **Always use**: Semantic tokens like `bg-card`, `text-card-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary`

### Common Color Patterns

```tsx
// Cards
bg-card text-card-foreground

// Muted text
text-muted-foreground

// Primary actions
bg-primary text-primary-foreground

// Borders
border-border

// Backgrounds
bg-background
```

## Component Standards

### Page Structure

```tsx
import { layout, spacing, typography } from '@/styles/design-tokens';

const MyPage = () => (
  <AppLayout>
    <div className={layout.container}>
      <div className={spacing.section}>
        {/* Header */}
        <div className={layout.flex.between}>
          <div>
            <h1 className={typography.pageTitle}>Page Title</h1>
            <p className={typography.pageSubtitle}>Description</p>
          </div>
          <Button>Action</Button>
        </div>

        {/* Stats Grid */}
        <div className={layout.grid.stats}>
          <StatCard />
          <StatCard />
          <StatCard />
          <StatCard />
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className={typography.cardTitle}>Section</CardTitle>
          </CardHeader>
          <CardContent className={spacing.card}>
            {/* Content */}
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
);
```

### Button Variants

Prefer semantic variants over custom styles:

- `variant="default"` - Primary actions
- `variant="secondary"` - Secondary actions
- `variant="outline"` - Tertiary actions
- `variant="ghost"` - Subtle actions
- `variant="destructive"` - Delete/remove actions

### Button Sizes

```tsx
<Button size="default">  // Standard
<Button size="sm">       // Compact
<Button size="lg">       // Large/prominent
<Button size="icon">     // Icon-only
```

## Best Practices

### ✅ DO

- Use design tokens from `design-tokens.ts`
- Use semantic color tokens (bg-card, text-muted-foreground)
- Keep consistent spacing with predefined tokens
- Use layout.grid patterns for responsive layouts
- Follow typography hierarchy

### ❌ DON'T

- Use arbitrary Tailwind spacing (space-y-7, gap-5)
- Use direct colors (text-white, bg-black)
- Create custom spacing without adding to tokens
- Mix different spacing patterns on same page
- Use inline styles or style props

## Shadcn Component Customization

All shadcn components should be customized with variants using the design system:

```tsx
// button.tsx - Add custom variants
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Add custom variants here using semantic tokens
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      }
    }
  }
);
```

## Maintenance

When adding new UI patterns:

1. Check if existing tokens can be used
2. If not, add to `design-tokens.ts`
3. Update this documentation
4. Ensure all new patterns use HSL semantic colors
5. Test in both light and dark modes

## Migration Guide

To convert existing components:

1. Import design tokens: `import { spacing, layout, typography } from '@/styles/design-tokens';`
2. Replace custom spacing with tokens
3. Replace direct colors with semantic tokens
4. Test visual consistency
5. Verify dark mode appearance

## Questions?

Refer to `src/styles/design-tokens.ts` for the complete token reference and usage examples.
