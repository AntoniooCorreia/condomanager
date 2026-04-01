import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Hammer,
  Calendar,
  Home,
  CreditCard,
  CalendarPlus,
  HardHat,
  User as UserIcon,
  Menu,
  X,
  Building2,
  LogOut,
  Shield,
  Camera,
  Box,
} from "lucide-react";
import { useState } from "react";
import { Chat } from "./Chat";
import { useAuth } from "../context/AuthContext";
import { ROLE_PERMISSIONS } from "../types/user";

interface MainLayoutProps {
  userType: "admin" | "user";
}

export function MainLayout({ userType }: MainLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  const permissions = currentUser ? ROLE_PERMISSIONS[currentUser.role] : null;

  const adminLinks = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "canViewDashboard" },
    { path: "/admin/condominos", label: "Condóminos", icon: Users, permission: "canViewDashboard" },
    { path: "/admin/financeiro", label: "Financeiro", icon: Wallet, permission: "canViewFinanceiro" },
    { path: "/admin/obras", label: "Obras", icon: Hammer, permission: "canManageObras" },
    { path: "/admin/reservas", label: "Reservas", icon: Calendar, permission: "canManageReservas" },
    { path: "/admin/utilizadores", label: "Utilizadores", icon: Shield, permission: "canManageUsers" },
    { path: "/admin/seguranca", label: "Segurança", icon: Camera, permission: "canViewSecurity" },
    { path: "/admin/visao3d", label: "Visão 3D", icon: Box, permission: "canView3D" },
  ];

  const userLinks = [
    { path: "/user", label: "Início", icon: Home, permission: null },
    { path: "/user/pagamentos", label: "Pagamentos", icon: CreditCard, permission: "canViewFinanceiro" },
    { path: "/user/reservar", label: "Reservar", icon: CalendarPlus, permission: "canReserve" },
    { path: "/user/obras", label: "Obras", icon: HardHat, permission: "canVote" },
    { path: "/user/seguranca", label: "Segurança", icon: Camera, permission: "canViewSecurity" },
    { path: "/user/visao3d", label: "Visão 3D", icon: Box, permission: "canView3D" },
    { path: "/user/perfil", label: "Perfil", icon: UserIcon, permission: null },
  ];

  const links = userType === "admin" ? adminLinks : userLinks;

  // Filter links based on permissions
  const filteredLinks = links.filter((link) => {
    if (!link.permission) return true;
    return permissions?.[link.permission as keyof typeof permissions] ?? false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                CondoGest
              </span>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  location.pathname === link.path ||
                  (link.path !== "/admin" &&
                    link.path !== "/user" &&
                    location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link
              to="/"
              className="flex items-center w-full group px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
              <span className="ml-3 text-gray-700">Sair</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 flex h-16 items-center gap-x-4 bg-white border-b border-gray-200 px-4 shadow-sm">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-700"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <div className="flex items-center">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="ml-2 font-semibold text-gray-900">CondoGest</span>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-16 items-center px-6 border-b border-gray-200">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="ml-2 font-semibold text-gray-900">CondoGest</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  location.pathname === link.path ||
                  (link.path !== "/admin" &&
                    link.path !== "/user" &&
                    location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mt-4 border-t border-gray-200 pt-4"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Sair</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="min-h-screen p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Chat Component */}
      {permissions?.canChat && <Chat />}
    </div>
  );
}