import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "horizontal";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: "h-6 w-6", text: "text-sm" },
  md: { icon: "h-8 w-8", text: "text-base" },
  lg: { icon: "h-10 w-10", text: "text-lg" },
  xl: { icon: "h-12 w-12", text: "text-xl" },
};

export const Logo = ({ 
  size = "md", 
  variant = "full", 
  showText = true,
  className 
}: LogoProps) => {
  const { icon, text } = sizeMap[size];
  const iconOnly = variant === "icon" || !showText;

  return (
    <div className={cn(
      "flex items-center gap-3",
      variant === "full" && "flex-col",
      variant === "horizontal" && "flex-row",
      className
    )}>
      {/* TD Monogram - Financial Times inspired */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(icon, "shrink-0")}
        aria-label="The Trading Diary Logo"
      >
        <defs>
          {/* Gradient for premium feel */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" className="text-primary" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.85" className="text-primary" />
          </linearGradient>
        </defs>
        
        {/* T letter - vertical and horizontal bars */}
        {/* Horizontal top bar of T */}
        <rect
          x="8"
          y="10"
          width="24"
          height="5"
          fill="url(#logoGradient)"
          className="text-primary"
        />
        
        {/* Vertical stem of T */}
        <rect
          x="17"
          y="10"
          width="6"
          height="28"
          fill="url(#logoGradient)"
          className="text-primary"
        />
        
        {/* D letter - intertwined with T */}
        {/* Vertical bar of D */}
        <rect
          x="25"
          y="15"
          width="6"
          height="23"
          fill="url(#logoGradient)"
          className="text-primary"
        />
        
        {/* Curved part of D - using path for smooth curve */}
        <path
          d="M 31 15 L 38 15 Q 42 15 42 19 L 42 34 Q 42 38 38 38 L 31 38 Z"
          fill="url(#logoGradient)"
          className="text-primary"
        />
        
        {/* Inner curve cutout of D */}
        <path
          d="M 31 20 L 35 20 Q 37 20 37 22 L 37 31 Q 37 33 35 33 L 31 33 Z"
          fill="currentColor"
          className="text-background"
        />
        
        {/* Subtle border for definition */}
        <rect
          x="7"
          y="9"
          width="36"
          height="30"
          rx="2"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          className="text-primary opacity-20"
        />
      </svg>

      {/* Brand text */}
      {!iconOnly && (
        <span className={cn(
          "font-semibold tracking-tight",
          text,
          variant === "full" ? "text-center" : ""
        )}>
          The Trading Diary
        </span>
      )}
    </div>
  );
};
