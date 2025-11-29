import { Link, useLocation } from "wouter";
import { Home, Map, Dumbbell, MessageSquare, User, Menu, LogOut, ListChecks, Book, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/roadmap", icon: Map, label: "Roadmap" },
    { href: "/workout", icon: Dumbbell, label: "Workout" },
    { href: "/templates", icon: LayoutTemplate, label: "Templates" },
    { href: "/exercises", icon: ListChecks, label: "Exercises" },
    { href: "/journal", icon: Book, label: "Daily Journal" },
    { href: "/coach", icon: MessageSquare, label: "Coach" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading text-xl">
            C
          </div>
          <span className="text-2xl font-heading font-bold tracking-wider text-white">
            CALISTHENI<span className="text-primary">X</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-sidebar-border space-y-2">
          <div className="bg-sidebar-accent/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Current Plan</p>
            <p className="text-sm font-medium text-foreground">Hypertrophy Push/Pull</p>
          </div>
          <a href="/api/logout" className="block">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </a>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        <header className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading">
              C
            </div>
            <span className="text-xl font-heading font-bold tracking-wider text-white">
              CALISTHENI<span className="text-primary">X</span>
            </span>
          </div>

          {/* Mobile Menu Sheet */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-sidebar border-sidebar-border text-foreground">
              <div className="flex flex-col gap-4 mt-8">
                <a href="/api/logout">
                  <Button variant="outline" className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 container max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 z-50">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className="flex flex-col items-center justify-center w-12 h-full gap-1 cursor-pointer group">
                  <div
                    className={cn(
                      "p-1.5 rounded-full transition-all duration-300",
                      isActive ? "bg-primary/10" : "bg-transparent"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors duration-300",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
