import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover } from '@/design-system/animations';

interface DepthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function DepthCard({ children, className, hover = true, ...props }: DepthCardProps) {
  const Comp = hover ? motion.div : 'div';
  const motionProps = hover
    ? { variants: cardHover, initial: 'rest', whileHover: 'hover' }
    : {};

  return (
    <Comp
      className={cn(
        'rounded-xl bg-card',
        'shadow-neu dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(255,255,255,0.03)]',
        'transition-all duration-300',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  );
}
