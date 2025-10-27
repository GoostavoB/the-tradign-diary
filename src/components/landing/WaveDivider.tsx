import { memo } from 'react';

interface WaveDividerProps {
  color?: string;
  flip?: boolean;
  className?: string;
}

export const WaveDivider = memo(({ color = "currentColor", flip = false, className = "" }: WaveDividerProps) => {
  return (
    <div className={`relative w-full ${flip ? 'rotate-180' : ''} ${className}`}>
      <svg 
        className="w-full h-16 md:h-24" 
        viewBox="0 0 1440 100" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fill={color} 
          d="M0,96L80,85.3C160,75,320,53,480,48C640,43,800,53,960,58.7C1120,64,1280,64,1360,64L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
});

WaveDivider.displayName = 'WaveDivider';
