import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';

interface PremiumTableProps {
    headers?: string[];
    children: ReactNode;
    className?: string;
    density?: 'comfortable' | 'compact';
}

interface PremiumTableRowProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    density?: 'comfortable' | 'compact';
}

export function PremiumTable({
    headers,
    children,
    className,
    density = 'comfortable'
}: PremiumTableProps) {
    return (
        <div className={cn("w-full space-y-2", className)}>
            {headers && (
                <div className={cn(
                    "grid gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider",
                    density === 'compact' ? 'mb-1' : 'mb-2'
                )}
                    style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}
                >
                    {headers.map((header, i) => (
                        <div key={i} className={i === 0 ? "text-left" : "text-right"}>
                            {header}
                        </div>
                    ))}
                </div>
            )}
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

export function PremiumTableRow({
    children,
    className,
    onClick,
    density = 'comfortable'
}: PremiumTableRowProps) {
    return (
        <GlassCard
            variant="default"
            hover
            className={cn(
                "group relative transition-all duration-300 flex items-center justify-between gap-4",
                density === 'compact' ? 'p-3' : 'p-4',
                onClick && "cursor-pointer active:scale-[0.99]",
                className
            )}
            onClick={onClick}
        >
            {children}
        </GlassCard>
    );
}
