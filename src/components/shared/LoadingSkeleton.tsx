import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'stat';
  count?: number;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 rounded-md bg-muted animate-shimmer',
        'bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted/60 to-muted',
        className
      )}
    />
  );
}

export function LoadingSkeleton({ className, variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'text') {
    return (
      <div className={cn('space-y-3', className)}>
        {items.map(i => (
          <SkeletonLine key={i} className={i === items.length - 1 ? 'w-3/4' : 'w-full'} />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="h-10 w-10 rounded-full bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted/60 to-muted" />
        <div className="space-y-2 flex-1">
          <SkeletonLine className="w-1/3 h-3" />
          <SkeletonLine className="w-1/2 h-3" />
        </div>
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div className={cn('space-y-2', className)}>
        <SkeletonLine className="w-1/4 h-8" />
        <SkeletonLine className="w-1/2 h-3" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map(i => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-3">
          <SkeletonLine className="w-2/3 h-5" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-4/5" />
        </div>
      ))}
    </div>
  );
}
