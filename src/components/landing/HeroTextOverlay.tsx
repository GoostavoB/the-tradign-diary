import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroTextOverlay = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial load animations
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        delay: 0.2,
      })
        .from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          '-=0.6'
        )
        .from(
          ctaRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
          },
          '-=0.4'
        );

      // Scroll-triggered parallax fade out
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          if (containerRef.current) {
            const opacity = 1 - self.progress * 1.5;
            const y = self.progress * 100;
            containerRef.current.style.opacity = Math.max(0, opacity).toString();
            containerRef.current.style.transform = `translateY(${y}px)`;
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToNextSection = () => {
    const nextSection = document.querySelector('#features-section');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Main headline */}
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          {t('hero.title', 'Transform Your Trading Journey')}
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          {t(
            'hero.subtitle',
            'Visualize performance, track progress, and level up your trading game with gamified analytics'
          )}
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white"
            onClick={() => navigate('/auth')}
          >
            {t('hero.cta', 'Start for Free')}
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10"
            onClick={scrollToNextSection}
          >
            {t('hero.explore', 'Explore Features')}
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex items-center justify-center gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <span>4.8/5 from 127+ traders</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNextSection}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        aria-label="Scroll to features"
      >
        <ChevronDown className="w-8 h-8 text-white/60" />
      </button>
    </div>
  );
};

export default HeroTextOverlay;
