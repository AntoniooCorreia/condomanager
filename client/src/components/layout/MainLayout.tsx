import { ReactNode } from "react";
import { FloatingChat } from "@/components/FloatingChat";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";


interface MainLayoutProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function MainLayout({ children, requireAdmin = false }: MainLayoutProps) {
  const { user, isLoading } = useAuth();

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  if (requireAdmin && user.role !== "admin" && user.role !== "administrador" && user.userType !== "administrador") {
    return <Redirect to="/user" />;
  }

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-slate-50/50 dark:bg-slate-950">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 glass-panel z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-black/5" />
              <h2 className="font-display font-semibold text-lg hidden sm:block">
                Bom dia, {user.name.split(' ')[0]}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" className="relative hover:bg-primary/5 rounded-full">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      
    </SidebarProvider>
      <FloatingChat />
  );
}
