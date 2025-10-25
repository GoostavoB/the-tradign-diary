// Analytics event tracking utilities

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  console.log('Analytics event:', eventName, properties);
};

export const trackLandingEvents = {
  trackViewHome: () => trackEvent('track_view_home'),
  trackViewPricing: () => trackEvent('track_view_pricing'),
  trackCTAHeroClick: (source: string) => trackEvent('track_cta_hero_click', { source }),
  trackStartTrial: (plan: string) => trackEvent('start_trial', { plan }),
  trackWatchDemo: () => trackEvent('watch_demo'),
  trackUploadStarted: () => trackEvent('track_upload_started'),
  trackUploadCompleted: () => trackEvent('track_upload_completed'),
  trackWatchDemo50: () => trackEvent('track_watch_demo_50'),
  trackWatchDemo100: () => trackEvent('track_watch_demo_100'),
  trackSelectPlanClick: (plan: string) => trackEvent('track_select_plan_click', { plan }),
  trackCheckoutCompleted: (plan: string, amount: number) => 
    trackEvent('track_checkout_completed', { plan, amount }),
  trackEvent: (eventName: string, properties?: Record<string, any>) => trackEvent(eventName, properties),
};
