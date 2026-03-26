import { useState, useEffect } from 'react';
import { X, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User as AppUser, Page } from '@/App';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar, menuItems } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';

interface DashboardLayoutProps {
  user: AppUser;
  currentPage: string;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, currentPage, onNavigate, onLogout, children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        currentPage={currentPage}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 z-40 relative">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <span className="font-bold text-lg text-primary">ClinicalScribe</span>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
            <AvatarFallback>DR</AvatarFallback>
          </Avatar>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm lg:hidden animate-in slide-in-from-left duration-200">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-xl ml-2">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id as Page);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-4 w-full px-4 py-4 rounded-xl transition-colors text-lg",
                        isActive ? "bg-primary text-primary-foreground font-medium" : "bg-muted/30 hover:bg-muted"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="absolute bottom-8 left-4 right-4">
                <Button variant="outline" className="w-full gap-2 py-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onLogout}>
                  <LogOut className="w-5 h-5" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Top Bar */}
        <TopBar user={user} currentPage={currentPage} />

        {/* Content */}
        <main className="flex-1 overflow-auto bg-muted/10 p-4 lg:p-8 pb-20 lg:pb-8 relative">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={onNavigate}
        onMorePress={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}
