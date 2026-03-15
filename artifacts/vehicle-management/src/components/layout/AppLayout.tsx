import * as React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, CarFront, Tags, CalendarDays, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Vehicle Types", href: "/vehicle-types", icon: Tags },
  { name: "Vehicles", href: "/vehicles", icon: CarFront },
  { name: "Bookings", href: "/bookings", icon: CalendarDays },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location !== "/") return false;
    if (path !== "/" && location.startsWith(path)) return true;
    return location === path;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center px-8 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <CarFront className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold leading-none tracking-tight text-foreground">Auto<span className="text-primary">Drive</span></h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Management System</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                active 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
              )}
            >
              <item.icon className={cn("h-5 w-5", active ? "text-primary-foreground" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="rounded-xl bg-accent/50 p-4 border border-accent">
          <p className="text-xs font-semibold text-primary">System Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 glass-panel border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Menu */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 glass-panel z-40 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <CarFront className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg">AutoDrive</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-foreground"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-2xl lg:hidden"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen pt-16 lg:pt-0">
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
