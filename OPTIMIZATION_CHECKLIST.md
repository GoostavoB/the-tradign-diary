# Performance Optimization Checklist

Use this checklist when adding new features or reviewing existing code.

## ✅ Component Optimization

### Before Creating a Component
- [ ] Is this component truly needed or can existing ones be reused?
- [ ] Will this component re-render frequently?
- [ ] Does this component have expensive calculations?
- [ ] Will this component receive complex props?

### Component Implementation
- [ ] Wrap with `React.memo` if props don't change often
- [ ] Use `useMemo` for expensive calculations
- [ ] Use `useCallback` for functions passed to children
- [ ] Avoid inline object/array creation in JSX
- [ ] Use proper React keys for lists
- [ ] Implement proper loading states

### Example
```tsx
// ❌ Bad
export const MyComponent = ({ data }) => {
  const processed = expensiveCalculation(data); // Recalculates every render
  return <Child onClick={() => console.log('click')} />; // New function every render
};

// ✅ Good
export const MyComponent = memo(({ data }) => {
  const processed = useMemo(() => expensiveCalculation(data), [data]);
  const handleClick = useCallback(() => console.log('click'), []);
  return <Child onClick={handleClick} />;
});
```

## 📊 Data Optimization

### Fetching Data
- [ ] Implement caching for repeated requests
- [ ] Use pagination or infinite scroll for large datasets
- [ ] Batch multiple requests when possible
- [ ] Add proper error handling and retry logic
- [ ] Show loading states during fetch

### Processing Data
- [ ] Memoize filtered/sorted data
- [ ] Use virtual scrolling for large lists (>100 items)
- [ ] Process data in chunks to avoid blocking
- [ ] Cache processed results

### Example
```tsx
// ❌ Bad
const filteredData = data.filter(item => item.active); // Filters on every render

// ✅ Good
const filteredData = useMemo(
  () => data.filter(item => item.active),
  [data]
);
```

## 🎨 Rendering Optimization

### Lists and Tables
- [ ] Use `key` prop correctly (not index for dynamic lists)
- [ ] Implement virtual scrolling for >100 items
- [ ] Use `React.memo` for list item components
- [ ] Lazy load images in lists
- [ ] Paginate or use infinite scroll

### Conditional Rendering
- [ ] Use lazy loading for heavy components
- [ ] Defer rendering of below-fold content
- [ ] Use Suspense boundaries appropriately
- [ ] Show skeleton loaders during load

### Charts and Visualizations
- [ ] Reduce data points on mobile
- [ ] Use canvas instead of SVG for >1000 points
- [ ] Implement chart lazy loading
- [ ] Debounce resize handlers
- [ ] Disable animations on low-end devices

## 🚀 Loading Optimization

### Initial Load
- [ ] Code split by route
- [ ] Lazy load heavy dependencies
- [ ] Preload critical resources
- [ ] Optimize images (WebP, lazy loading)
- [ ] Minimize main bundle size

### Progressive Enhancement
- [ ] Show content as it loads
- [ ] Use skeleton screens
- [ ] Implement proper loading boundaries
- [ ] Defer non-critical scripts

## 📱 Mobile Optimization

### Responsive Design
- [ ] Reduce data for mobile views
- [ ] Simplify complex interactions
- [ ] Use touch-friendly targets (min 44px)
- [ ] Test on low-end devices
- [ ] Respect `prefers-reduced-motion`

### Performance
- [ ] Reduce bundle size for mobile
- [ ] Minimize network requests
- [ ] Use smaller images on mobile
- [ ] Disable heavy animations

## 🔄 State Management

### Component State
- [ ] Keep state as local as possible
- [ ] Avoid unnecessary state
- [ ] Use derived state instead of duplicating
- [ ] Batch state updates when possible

### Global State
- [ ] Only store what's truly global
- [ ] Normalize nested data structures
- [ ] Use selectors to prevent re-renders
- [ ] Implement proper cache invalidation

## 🎯 Event Handlers

### Input Events
- [ ] Debounce search inputs (300ms)
- [ ] Throttle scroll handlers (100ms)
- [ ] Throttle resize handlers (200ms)
- [ ] Use passive event listeners where possible

### Click Events
- [ ] Memoize event handlers
- [ ] Avoid creating new functions in JSX
- [ ] Use event delegation for lists

## 🖼️ Asset Optimization

### Images
- [ ] Use WebP format
- [ ] Implement lazy loading
- [ ] Add width/height attributes
- [ ] Use responsive images (srcset)
- [ ] Compress images appropriately

### Fonts
- [ ] Preload critical fonts
- [ ] Use font-display: swap
- [ ] Limit number of font weights
- [ ] Consider system fonts

## 📦 Bundle Optimization

### Dependencies
- [ ] Audit bundle size regularly
- [ ] Tree-shake unused code
- [ ] Replace heavy libraries with lighter alternatives
- [ ] Use dynamic imports for large dependencies

### Code Splitting
- [ ] Split by route
- [ ] Split heavy components
- [ ] Lazy load modals/dialogs
- [ ] Use React.lazy appropriately

## 🧪 Testing Performance

### Development
- [ ] Use Performance Monitor in dev mode
- [ ] Check React DevTools Profiler
- [ ] Monitor bundle size changes
- [ ] Test on throttled network
- [ ] Test on low-end devices

### Production
- [ ] Monitor Web Vitals
- [ ] Track Core Web Vitals (LCP, FID, CLS)
- [ ] Set up performance budgets
- [ ] Use Lighthouse for audits

## 🔍 Monitoring

### Metrics to Track
- [ ] First Contentful Paint (FCP)
- [ ] Largest Contentful Paint (LCP)
- [ ] Interaction to Next Paint (INP)
- [ ] Cumulative Layout Shift (CLS)
- [ ] Time to First Byte (TTFB)
- [ ] Bundle size
- [ ] API response times

## ⚡ Quick Wins

Common optimizations you can apply immediately:

1. **Memoize components that receive stable props**
   ```tsx
   export default memo(MyComponent);
   ```

2. **Memoize expensive calculations**
   ```tsx
   const value = useMemo(() => calculate(), [deps]);
   ```

3. **Memoize callbacks passed to children**
   ```tsx
   const handleClick = useCallback(() => {}, [deps]);
   ```

4. **Lazy load routes**
   ```tsx
   const Route = lazy(() => import('./Route'));
   ```

5. **Add loading boundaries**
   ```tsx
   <Suspense fallback={<Skeleton />}>
     <HeavyComponent />
   </Suspense>
   ```

## 🎓 Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Size Matters](https://bundlephobia.com/)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

## 📝 Review Process

Before merging:
1. Run performance audit
2. Check bundle size impact
3. Test on mobile devices
4. Verify no layout shifts
5. Check loading states
6. Test with throttled network
