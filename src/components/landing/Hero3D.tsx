import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import FloatingWidget from './FloatingWidget';
import ParticleBackground from './ParticleBackground';
import HeroTextOverlay from './HeroTextOverlay';
import { PerspectiveCamera } from '@react-three/drei';

const Hero3D = () => {
  const { isMobile, isTablet } = useMobileOptimization();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Delay 3D scene load slightly for smooth initial render
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mobile gets no 3D scene - use MobileHero instead
  if (isMobile) return null;

  const widgetCount = isTablet ? 3 : 5;
  const particleCount = isTablet ? 25 : 50;

  // Widget data extracted from dashboard
  const widgets = [
    {
      id: 'stats',
      title: 'Total P&L',
      value: '$252',
      trend: '+12.5%',
      color: '#0EA5E9',
      position: [-2.5, 1.2, 0] as [number, number, number],
      rotation: [0.1, 0.2, 0] as [number, number, number],
    },
    {
      id: 'winrate',
      title: 'Win Rate',
      value: '76.5%',
      trend: 'Strong',
      color: '#10B981',
      position: [2.2, 0.8, -0.5] as [number, number, number],
      rotation: [-0.05, -0.15, 0.05] as [number, number, number],
    },
    {
      id: 'profit',
      title: 'Profit Factor',
      value: '1.46',
      trend: '+0.12',
      color: '#F59E0B',
      position: [-1.8, -0.8, -1] as [number, number, number],
      rotation: [0.08, 0.1, -0.05] as [number, number, number],
    },
    {
      id: 'roi',
      title: 'ROI',
      value: '+8.02%',
      trend: '↑',
      color: '#8B5CF6',
      position: [2.8, -1.2, -1.5] as [number, number, number],
      rotation: [-0.1, -0.2, 0.08] as [number, number, number],
    },
    {
      id: 'best',
      title: 'Best Trade',
      value: '+22.8%',
      trend: 'BTCUSDT',
      color: '#EC4899',
      position: [0, -1.8, -0.8] as [number, number, number],
      rotation: [0.05, 0, -0.03] as [number, number, number],
    },
  ].slice(0, widgetCount);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Canvas */}
      {isLoaded && (
        <div className="absolute inset-0 z-0">
          <Canvas
            dpr={[1, isTablet ? 1.5 : 2]}
            performance={{ min: 0.5 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
              
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 10, 10]} angle={0.3} intensity={0.5} />
              <pointLight position={[-10, -10, -10]} intensity={0.3} color="#0EA5E9" />
              
              {/* Particle Background */}
              <ParticleBackground count={particleCount} />
              
              {/* Floating Widgets */}
              {widgets.map((widget) => (
                <FloatingWidget
                  key={widget.id}
                  position={widget.position}
                  rotation={widget.rotation}
                  data={widget}
                />
              ))}
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Text Overlay */}
      <HeroTextOverlay />
      
      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default Hero3D;
