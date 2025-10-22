import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";

interface Exchange {
  name: string;
  logo: string;
  alt: string;
}

const exchanges: Exchange[] = [
  { name: "Binance", logo: "/exchange-logos/binance.png", alt: "Binance logo" },
  { name: "Bybit", logo: "/exchange-logos/bybit.png", alt: "Bybit logo" },
  { name: "Coinbase", logo: "/exchange-logos/coinbase.png", alt: "Coinbase logo" },
  { name: "OKX", logo: "/exchange-logos/okx.svg", alt: "OKX logo" },
  { name: "Kraken", logo: "/exchange-logos/kraken.svg", alt: "Kraken logo" },
  { name: "KuCoin", logo: "/exchange-logos/kucoin.png", alt: "KuCoin logo" },
  { name: "Gate.io", logo: "/exchange-logos/gateio.svg", alt: "Gate.io logo" },
  { name: "MEXC", logo: "/exchange-logos/mexc.png", alt: "MEXC logo" },
  { name: "Bitfinex", logo: "/exchange-logos/bitfinex.png", alt: "Bitfinex logo" },
  { name: "Bitstamp", logo: "/exchange-logos/bitstamp.png", alt: "Bitstamp logo" },
  { name: "BingX", logo: "/exchange-logos/bingx.png", alt: "BingX logo" },
];

export const ExchangeCarousel = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  // Duplicate exchanges for seamless loop
  const duplicatedExchanges = [...exchanges, ...exchanges, ...exchanges];

  useEffect(() => {
    if (!isPaused) {
      const animate = async () => {
        // Calculate full width of one set
        const itemWidth = 120; // logo width + gap
        const totalWidth = exchanges.length * itemWidth;

        await controls.start({
          x: [-totalWidth, -totalWidth * 2],
          transition: {
            duration: 25, // 25 seconds for smooth premium feel
            ease: "linear",
            repeat: Infinity,
          },
        });
      };

      animate();
    } else {
      controls.stop();
    }
  }, [isPaused, controls]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const diff = touch.clientX - startX;
      x.set(diff);
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      
      const currentX = x.get();
      if (Math.abs(currentX) > 50) {
        // Swipe threshold
        setCurrentIndex((prev) => 
          currentX > 0 
            ? Math.max(0, prev - 1)
            : Math.min(exchanges.length - 1, prev + 1)
        );
      }
      x.set(0);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden py-8"
      aria-label="Partner exchanges"
      role="region"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
    >
      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-6 md:gap-10"
        animate={controls}
        style={{ x }}
      >
        {duplicatedExchanges.map((exchange, index) => (
          <motion.div
            key={`${exchange.name}-${index}`}
            className="flex-shrink-0 flex items-center justify-center p-4 md:p-5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            tabIndex={0}
            role="img"
            aria-label={exchange.alt}
          >
            <img
              src={exchange.logo}
              alt={exchange.alt}
              className="h-7 md:h-9 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
              loading="lazy"
            />
            <span className="hidden text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">
              {exchange.name}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Keyboard navigation hint */}
      <div className="sr-only" aria-live="polite">
        Use Tab to navigate through exchange logos. Press Space or Enter to focus.
      </div>
    </div>
  );
};
