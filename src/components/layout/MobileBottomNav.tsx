import { LayoutDashboard, Mic, Users, MessageCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Page } from '@/App';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: Page) => void;
  onMorePress: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'recording', label: 'Record', icon: Mic, isFab: true },
  { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export function MobileBottomNav({ currentPage, onNavigate, onMorePress }: MobileBottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isMore = item.id === 'more';

          if (item.isFab) {
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate(item.id as Page)}
                className={cn(
                  "flex flex-col items-center justify-center -mt-5",
                  "w-14 h-14 rounded-full shadow-depth-lg",
                  "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
                  currentPage === 'recording' && "ring-4 ring-blue-500/20"
                )}
              >
                <Icon className="w-6 h-6" />
              </motion.button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => isMore ? onMorePress() : onNavigate(item.id as Page)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 touch-target",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
