import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { isPublicRoute } from '@/utils/languageRouting';
import logoVietnam from '@/assets/logo-vietnam.png';

interface VietnamLogoWrapperProps {
  children: React.ReactNode;
}

export const VietnamLogoWrapper = ({ children }: VietnamLogoWrapperProps) => {
  const location = useLocation();
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Detect Vietnamese context
  const isPublic = isPublicRoute(location.pathname);
  const isVietnameseContext = isPublic 
    ? location.pathname === '/vi' || location.pathname.startsWith('/vi/')
    : language === 'vi';

  // If not Vietnamese context, just render children
  if (!isVietnameseContext) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsHovered(!isHovered);
    
    // Auto-reset after 3 seconds on mobile
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative inline-block cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {/* Default logo - fades out on hover */}
      <div
        className="transition-all duration-[600ms]"
        style={{
          transform: isHovered ? 'scale(0.98) rotate(-2deg)' : 'scale(1) rotate(0deg)',
          opacity: isHovered ? 0 : 1,
          filter: isHovered ? 'blur(2px)' : 'blur(0px)',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {children}
      </div>

      {/* Vietnam logo - fades in on hover */}
      <div
        className="absolute top-0 left-0 transition-all duration-[600ms]"
        style={{
          transform: isHovered ? 'scale(1.02) rotate(2deg)' : 'scale(0.98) rotate(-2deg)',
          opacity: isHovered ? 1 : 0,
          filter: isHovered ? 'brightness(1.1) blur(0px)' : 'brightness(1) blur(2px)',
          boxShadow: isHovered ? '0 0 20px rgba(255, 215, 0, 0.4)' : '0 0 0px rgba(255, 215, 0, 0)',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      >
        <img 
          src={logoVietnam} 
          alt="The Trading Diary - Vietnam" 
          className="h-full w-auto object-contain"
          style={{
            height: 'var(--logo-height, 32px)',
            maxHeight: '100%',
          }}
        />
      </div>
    </div>
  );
};
