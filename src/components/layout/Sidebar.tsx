import {
  LayoutDashboard, Mic, Settings, LogOut, Stethoscope,
  MessageCircle, Users, ChevronLeft, ChevronRight, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User as AppUser, Page } from '@/App';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

export const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'recording', label: 'New Recording', icon: Mic },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'image-analysis', label: 'Image Analysis', icon: Stethoscope },
  { id: 'chat', label: 'AI Assistant', icon: MessageCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  user: AppUser;
  currentPage: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Sidebar({ user, currentPage, isOpen, onToggle, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out z-30 sticky top-0 h-screen",
        "shadow-depth-sm",
        isOpen ? "w-[260px]" : "w-[80px]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-16 flex items-center px-4 border-b border-border transition-all",
        isOpen ? "justify-between" : "justify-center"
      )}>
        {isOpen ? (
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-primary tracking-tight">ClinicalScribe</span>
          </div>
        ) : (
          <div className="bg-primary/10 p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6 text-muted-foreground", !isOpen && "hidden")}
          onClick={onToggle}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto py-6">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            if (!isOpen) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onNavigate(item.id as Page)}
                      className={cn(
                        "w-full h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-glow-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium bg-foreground text-background border-none ml-2">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Page)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform", isActive ? "" : "group-hover:scale-110")} />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                )}
              </button>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border mt-auto">
        {isOpen ? (
          <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl border border-border/50">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
              <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.specialty}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 hover:opacity-100" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-9 w-9 border border-border cursor-pointer hover:ring-2 ring-primary transition-all">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
              <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Toggle when collapsed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-20 bg-background border border-border rounded-full h-6 w-6 p-0 shadow-sm z-50 hover:bg-accent"
          onClick={onToggle}
        >
          <ChevronRight className="w-3 h-3" />
        </Button>
      )}
    </aside>
  );
}
