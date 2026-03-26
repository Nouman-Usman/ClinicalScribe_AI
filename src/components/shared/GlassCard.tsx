import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover } from '@/design-system/animations';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className, hover = true, glow = false, ...props }: GlassCardProps) {
  const Comp = hover ? motion.div : 'div';
  const motionProps = hover
    ? { variants: cardHover, initial: 'rest', whileHover: 'hover' }
    : {};

  return (
    <Comp
      className={cn(
        'glass rounded-xl border border-white/20 dark:border-white/[0.08]',
        'shadow-depth-md transition-shadow duration-300',
        glow && 'shadow-glow-primary',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  );
}
