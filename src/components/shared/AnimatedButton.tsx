import { motion } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface AnimatedButtonProps extends ButtonProps {
  gradient?: 'primary' | 'secondary' | 'success' | 'danger';
}

const gradientClasses = {
  primary: 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-0',
  secondary: 'bg-gradient-to-r from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800 text-white border-0',
  success: 'bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white border-0',
  danger: 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-0',
};

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, gradient, children, ...props }, ref) => {
    return (
      <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
        <Button
          ref={ref}
          className={cn(
            'transition-all duration-200',
            gradient && gradientClasses[gradient],
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);
AnimatedButton.displayName = 'AnimatedButton';
