import { 
  Building2, LayoutDashboard, Users, CreditCard, HardHat, 
  Calendar, ShieldAlert, UserCircle, LogOut, Settings 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isAdmin = user?.role === "admin";

  const adminLinks = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Condóminos", url: "/admin/condominos", icon: Users },
    { title: "Financeiro", url: "/admin/financeiro", icon: CreditCard },
    { title: "Obras", url: "/admin/obras", icon: HardHat },
    { title: "Reservas", url: "/admin/reservas", icon: Calendar },
    { title: "Utilizadores", url: "/admin/utilizadores", icon: UserCircle },
    { title: "Segurança", url: "/admin/seguranca", icon: ShieldAlert },
  ];

  const userLinks = [
    { title: "Dashboard", url: "/user", icon: LayoutDashboard },
    { title: "Meus Pagamentos", url: "/user/pagamentos", icon: CreditCard },
    { title: "Reservar Áreas", url: "/user/reservar", icon: Calendar },
    { title: "Obras no Edifício", url: "/user/obras", icon: HardHat },
    { title: "Ocorrências", url: "/user/seguranca", icon: ShieldAlert },
    { title: "Meu Perfil", url: "/user/perfil", icon: UserCircle },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <Sidebar variant="inset">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <div className="flex items-center gap-3 px-4 py-6 mb-2">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-sidebar-foreground leading-none">Prestige</h1>
              <p className="text-xs text-muted-foreground mt-1">Condominium Mgt.</p>
            </div>
          </div>
          
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold opacity-70">
            {isAdmin ? "Administração" : "Área do Condómino"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-medium" : "hover:bg-primary/5"}
                    >
                      <Link href={item.url} className="flex items-center gap-3 transition-colors duration-200">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-sidebar/50 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-14 px-2 hover:bg-secondary/50 rounded-xl transition-colors">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback className="bg-primary text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1 ml-3 min-w-0">
                <span className="text-sm font-bold truncate w-full">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{user?.unit ? `Fração ${user.unit}` : "Administrador"}</span>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 p-2 shadow-xl border-border/50">
            <DropdownMenuLabel className="font-display font-bold">A Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={isAdmin ? "/admin/perfil" : "/user/perfil"} className="flex items-center cursor-pointer">
                <UserCircle className="w-4 h-4 mr-3" />
                <span>Perfil e Infos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 cursor-pointer" onClick={logout}>
              <LogOut className="w-4 h-4 mr-3" />
              <span>Sair do Sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
