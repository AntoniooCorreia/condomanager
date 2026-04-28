import { 
  LayoutDashboard, Users, CreditCard, HardHat, 
  Calendar, ShieldAlert, UserCircle, LogOut, Settings, Camera, Receipt
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isAdmin = user?.role === "admin";
  const isCondomino = user?.userType === "condomino" || user?.userType === "gestor";

  const adminLinks = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Utilizadores", url: "/admin/utilizadores", icon: Users },
    { title: "Financeiro", url: "/admin/financeiro", icon: CreditCard },
    { title: "Obras", url: "/admin/obras", icon: HardHat },
    { title: "Reservas", url: "/admin/reservas", icon: Calendar },
    { title: "Seguranca", url: "/admin/seguranca", icon: ShieldAlert },
    { title: "Cameras CCTV", url: "/admin/camaras", icon: Camera },
  ];

  const baseUserLinks = [
    { title: "Dashboard", url: "/user", icon: LayoutDashboard },
    { title: "Pagamentos", url: "/user/pagamentos", icon: CreditCard },
    ...(isCondomino ? [{ title: "Cobrancas", url: "/user/cobrancas", icon: Receipt }] : []),
    { title: "Reservar Areas", url: "/user/reservar", icon: Calendar },
    { title: "Obras no Edificio", url: "/user/obras", icon: HardHat },
    { title: "Ocorrencias", url: "/user/seguranca", icon: ShieldAlert },
    { title: "Cameras CCTV", url: "/user/camaras", icon: Camera },
    { title: "Meu Perfil", url: "/user/perfil", icon: UserCircle },
  ];

  const links = isAdmin ? adminLinks : baseUserLinks;

  return (
    <Sidebar variant="inset">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <div className="flex items-center px-4 py-6 mb-2">
            <img src="/logoazulpng.png" alt="Logo" className="w-40" />
          </div>

          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold opacity-70">
            {isAdmin ? "Administracao" : "Area do Condomino"}
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
            <button className="w-full h-14 px-2 hover:bg-secondary/50 rounded-xl transition-colors flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback className="bg-primary text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-bold truncate w-full">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{user?.unit ? `Fracao ${user.unit}` : "Administrador"}</span>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 shadow-xl border-border/50">
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