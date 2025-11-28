import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ParallaxTradingElements = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Candlestick formations
      gsap.to('.parallax-candlestick', {
        y: -100,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.3,
        },
      });

      // Order book
      gsap.to('.parallax-orderbook', {
        y: -120,
        rotation: 5,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.4,
        },
      });

      // Volume bars
      gsap.to('.parallax-volume', {
        y: -80,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      // Trend lines
      gsap.to('.parallax-trendline', {
        x: -60,
        y: -40,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.2,
        },
      });

      // Support/Resistance zones
      gsap.to('.parallax-zone', {
        y: -150,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Candlestick Formation */}
      <div className="parallax-element parallax-candlestick absolute top-[10%] left-[8%] opacity-[0.02]">
        <svg width="200" height="240" viewBox="0 0 200 240" fill="none">
          <rect x="40" y="20" width="30" height="100" fill="currentColor" className="text-primary" />
          <rect x="38" y="0" width="2" height="140" fill="currentColor" className="text-primary" />
          <rect x="120" y="80" width="30" height="120" fill="currentColor" className="text-foreground" />
          <rect x="133" y="60" width="2" height="160" fill="currentColor" className="text-foreground" />
        </svg>
      </div>

      {/* Order Book Depth Chart */}
      <div className="parallax-element parallax-orderbook absolute top-[25%] right-[5%] opacity-[0.03]">
        <svg width="300" height="200" viewBox="0 0 300 200" fill="none">
          <path
            d="M0 200 L50 180 L100 140 L150 100 L200 80 L250 60 L300 40"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-primary"
          />
          <path
            d="M300 200 L250 180 L200 150 L150 100 L100 90 L50 70 L0 50"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-foreground"
          />
        </svg>
      </div>

      {/* Volume Bars */}
      <div className="parallax-element parallax-volume absolute top-[60%] left-[15%] opacity-[0.035]">
        <svg width="150" height="180" viewBox="0 0 150 180" fill="none">
          <rect x="10" y="100" width="15" height="80" fill="currentColor" className="text-primary" opacity="0.6" />
          <rect x="35" y="60" width="15" height="120" fill="currentColor" className="text-primary" opacity="0.8" />
          <rect x="60" y="30" width="15" height="150" fill="currentColor" className="text-primary" />
          <rect x="85" y="80" width="15" height="100" fill="currentColor" className="text-foreground" opacity="0.7" />
          <rect x="110" y="110" width="15" height="70" fill="currentColor" className="text-foreground" opacity="0.5" />
        </svg>
      </div>

      {/* Trend Line */}
      <div className="parallax-element parallax-trendline absolute top-[40%] left-[50%] opacity-[0.025]">
        <svg width="400" height="2" viewBox="0 0 400 2" fill="none">
          <line x1="0" y1="1" x2="400" y2="1" stroke="currentColor" strokeWidth="1" className="text-primary" />
        </svg>
      </div>

      {/* Support/Resistance Zone */}
      <div className="parallax-element parallax-zone absolute top-[70%] right-[10%] opacity-[0.025]">
        <div className="w-80 h-16 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent backdrop-blur-sm rounded-l-full" />
      </div>

      {/* Additional Candlestick */}
      <div className="parallax-element parallax-candlestick absolute bottom-[15%] right-[20%] opacity-[0.03]">
        <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
          <rect x="30" y="40" width="20" height="80" fill="currentColor" className="text-foreground" />
          <rect x="38" y="20" width="2" height="120" fill="currentColor" className="text-foreground" />
          <rect x="70" y="60" width="20" height="60" fill="currentColor" className="text-primary" />
          <rect x="78" y="50" width="2" height="80" fill="currentColor" className="text-primary" />
        </svg>
      </div>
    </div>
  );
};
