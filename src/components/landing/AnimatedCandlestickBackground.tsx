import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Candle {
  x: number;
  y: number;
  width: number;
  height: number;
  wickHeight: number;
  isGreen: boolean;
  speed: number;
  opacity: number;
}

export const AnimatedCandlestickBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const candlesRef = useRef<Candle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Initialize candles
    const initCandles = () => {
      candlesRef.current = [];
      const numCandles = Math.floor(window.innerWidth / 60); // One candle every 60px
      
      for (let i = 0; i < numCandles; i++) {
        candlesRef.current.push({
          x: (i * canvas.width) / numCandles,
          y: Math.random() * canvas.height,
          width: 3 + Math.random() * 4,
          height: 20 + Math.random() * 60,
          wickHeight: 10 + Math.random() * 30,
          isGreen: Math.random() > 0.5,
          speed: 0.2 + Math.random() * 0.4,
          opacity: 0.1 + Math.random() * 0.2,
        });
      }
    };
    initCandles();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      candlesRef.current.forEach((candle) => {
        // Calculate distance from mouse
        const dx = mouseRef.current.x - candle.x;
        const dy = mouseRef.current.y - candle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;
        
        // Mouse interaction - push away from cursor
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          candle.x -= (dx / distance) * force * 2;
          candle.y -= (dy / distance) * force * 2;
        }

        // Slow drift upward
        candle.y -= candle.speed;

        // Reset if off screen
        if (candle.y < -100) {
          candle.y = canvas.height + 50;
          candle.x = Math.random() * canvas.width;
        }

        // Keep within bounds
        if (candle.x < -50) candle.x = canvas.width + 50;
        if (candle.x > canvas.width + 50) candle.x = -50;

        // Enhanced opacity based on distance from mouse
        let finalOpacity = candle.opacity;
        if (distance < maxDistance) {
          finalOpacity = candle.opacity + (maxDistance - distance) / maxDistance * 0.3;
        }

        // Draw candlestick with glow
        const color = candle.isGreen 
          ? `rgba(34, 197, 94, ${finalOpacity})` // green
          : `rgba(239, 68, 68, ${finalOpacity})`; // red

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = candle.isGreen ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';

        // Draw wick (thin line)
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(candle.x + candle.width / 2, candle.y - candle.wickHeight);
        ctx.lineTo(candle.x + candle.width / 2, candle.y + candle.height + candle.wickHeight);
        ctx.stroke();

        // Draw body (rectangle)
        ctx.fillStyle = color;
        ctx.fillRect(candle.x, candle.y, candle.width, candle.height);

        // Reset shadow
        ctx.shadowBlur = 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
};
