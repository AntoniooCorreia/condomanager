export type UserRole = "owner" | "condomino" | "arrendatario";

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: UserRole;
  fracao?: string;
  avatar?: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface Permissions {
  canManageUsers: boolean;
  canVote: boolean;
  canReserve: boolean;
  canViewFinanceiro: boolean;
  canManageObras: boolean;
  canManageReservas: boolean;
  canChat: boolean;
  canViewDashboard: boolean;
  canViewSecurity: boolean;
  canView3D: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  owner: {
    canManageUsers: true,
    canVote: true,
    canReserve: true,
    canViewFinanceiro: true,
    canManageObras: true,
    canManageReservas: true,
    canChat: true,
    canViewDashboard: true,
    canViewSecurity: true,
    canView3D: true,
  },
  condomino: {
    canManageUsers: false,
    canVote: true,
    canReserve: true,
    canViewFinanceiro: true,
    canManageObras: false,
    canManageReservas: false,
    canChat: true,
    canViewDashboard: false,
    canViewSecurity: true,
    canView3D: true,
  },
  arrendatario: {
    canManageUsers: false,
    canVote: false,
    canReserve: true,
    canViewFinanceiro: false,
    canManageObras: false,
    canManageReservas: false,
    canChat: true,
    canViewDashboard: false,
    canViewSecurity: false,
    canView3D: true,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Dono do Condomínio",
  condomino: "Condómino",
  arrendatario: "Arrendatário",
};