import { ExternalLink } from "lucide-react";
import { Button } from "./button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LearnMoreLinkProps {
  href: string;
  className?: string;
  variant?: "link" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
}

export function LearnMoreLink({ 
  href, 
  className,
  variant = "link",
  size = "sm" 
}: LearnMoreLinkProps) {
  return (
    <Button
      variant={variant}
      size={size}
      asChild
      className={cn("gap-1 h-auto p-0 text-xs", className)}
    >
      <Link to={href} target="_blank" rel="noopener noreferrer">
        Learn More
        <ExternalLink className="h-3 w-3" />
      </Link>
    </Button>
  );
}
