/**
 * Design Token System
 * Centralized design values for consistent UI across the application
 */

export const spacing = {
  section: 'space-y-8',
  sectionCompact: 'space-y-6',
  card: 'space-y-6',
  cardCompact: 'space-y-4',
  form: 'space-y-4',
  formCompact: 'space-y-3',
  inline: 'gap-2',
  inlineTight: 'gap-1',
  stack: 'gap-4',
  stackCompact: 'gap-3',
  grid: 'gap-4',
} as const;

export const layout = {
  container: 'container max-w-7xl mx-auto p-6',
  containerCompact: 'container max-w-7xl mx-auto p-4',
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    stats: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
    twoCol: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    threeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  },
  flex: {
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    center: 'flex items-center justify-center',
    col: 'flex flex-col',
  },
} as const;

export const card = {
  base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  glass: 'glass backdrop-blur-xl border border-white/10',
  interactive: 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer',
  padding: {
    default: 'p-6',
    compact: 'p-4',
    tight: 'p-3',
    header: 'p-6 pb-4',
    content: 'px-6 py-4',
  },
} as const;

export const typography = {
  pageTitle: 'text-3xl font-bold',
  pageSubtitle: 'text-muted-foreground mt-1',
  sectionTitle: 'text-2xl font-semibold',
  sectionSubtitle: 'text-sm text-muted-foreground mt-1',
  cardTitle: 'text-lg font-semibold',
  cardDescription: 'text-sm text-muted-foreground',
  label: 'text-sm font-medium',
  body: 'text-sm text-muted-foreground',
  bodyRegular: 'text-sm',
  caption: 'text-xs text-muted-foreground',
} as const;

export const button = {
  sizes: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  },
} as const;

export const animation = {
  transition: 'transition-all duration-200',
  transitionSlow: 'transition-all duration-300',
  hover: 'hover:scale-105 transition-transform',
  fadeIn: 'animate-fade-in',
} as const;

/**
 * Usage Examples:
 * 
 * import { spacing, layout, card, typography } from '@/styles/design-tokens';
 * 
 * <div className={layout.container}>
 *   <div className={spacing.section}>
 *     <h1 className={typography.pageTitle}>Page Title</h1>
 *     <p className={typography.pageSubtitle}>Subtitle</p>
 *   </div>
 *   
 *   <div className={layout.grid.stats}>
 *     <Card className={card.padding.default}>
 *       <h3 className={typography.cardTitle}>Card Title</h3>
 *       <p className={typography.body}>Body text</p>
 *     </Card>
 *   </div>
 * </div>
 */
