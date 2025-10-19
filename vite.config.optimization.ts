/**
 * Vite optimization configuration examples
 * Apply these to vite.config.ts for better production builds
 */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
          
          // Feature chunks
          'dashboard': [
            './src/pages/Dashboard.tsx',
            './src/components/DashboardCharts.tsx',
          ],
          'analytics': [
            './src/pages/Analytics.tsx',
            './src/components/DrawdownAnalysis.tsx',
          ],
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|webp|avif)$/.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        // JS file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // Optimize minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific functions
      },
      format: {
        comments: false, // Remove comments
      },
    },
    
    // Source maps for production debugging
    sourcemap: false, // Set to true for debugging, false for smaller builds
    
    // Report bundle size
    reportCompressedSize: true,
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // CSS code splitting
    cssCodeSplit: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    exclude: [
      // Exclude heavy dependencies that should be lazy loaded
      'recharts',
    ],
  },
  
  // Performance hints
  server: {
    hmr: {
      overlay: true,
    },
  },
});

/**
 * Additional optimization tips:
 * 
 * 1. Use dynamic imports for heavy components:
 *    const HeavyChart = lazy(() => import('./HeavyChart'));
 * 
 * 2. Preload critical routes:
 *    <link rel="preload" href="/dashboard" as="fetch" />
 * 
 * 3. Use web workers for heavy computations:
 *    new Worker(new URL('./worker.ts', import.meta.url))
 * 
 * 4. Implement proper caching headers in deployment:
 *    - Cache bust: [hash] in filenames
 *    - Long cache: immutable assets
 *    - Short cache: HTML files
 * 
 * 5. Monitor bundle size with:
 *    - vite-bundle-visualizer
 *    - rollup-plugin-visualizer
 * 
 * 6. Consider CDN for large dependencies
 * 
 * 7. Use compression (gzip/brotli) on server
 */
