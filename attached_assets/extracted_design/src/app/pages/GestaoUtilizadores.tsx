import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Shield,
  Key,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { User, UserRole, ROLE_LABELS, ROLE_PERMISSIONS } from "../types/user";
import { Switch } from "../components/ui/switch";

// Mock users data
const initialUsers: User[] = [
  {
    id: "1",
    nome: "Admin Condomínio",
    email: "admin@condogest.pt",
    telefone: "+351 910 000 000",
    role: "owner",
    ativo: true,
    dataCriacao: "2025-01-01",
  },
  {
    id: "2",
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "+351 912 345 678",
    role: "condomino",
    fracao: "1A",
    ativo: true,
    dataCriacao: "2025-02-15",
  },
  {
    id: "3",
    nome: "Maria Santos",
    email: "maria.santos@email.com",
    telefone: "+351 913 456 789",
    role: "condomino",
    fracao: "1B",
    ativo: true,
    dataCriacao: "2025-02-15",
  },
  {
    id: "4",
    nome: "Pedro Costa",
    email: "pedro.costa@email.com",
    telefone: "+351 914 567 890",
    role: "condomino",
    fracao: "2A",
    ativo: true,
    dataCriacao: "2025-03-01",
  },
  {
    id: "5",
    nome: "Ana Rodrigues",
    email: "ana.rodrigues@email.com",
    telefone: "+351 915 678 901",
    role: "arrendatario",
    fracao: "2B",
    ativo: true,
    dataCriacao: "2025-06-10",
  },
  {
    id: "6",
    nome: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    telefone: "+351 916 789 012",
    role: "condomino",
    fracao: "3A",
    ativo: true,
    dataCriacao: "2025-03-15",
  },
  {
    id: "7",
    nome: "Sofia Ferreira",
    email: "sofia.ferreira@email.com",
    telefone: "+351 917 890 123",
    role: "arrendatario",
    fracao: "3B",
    ativo: false,
    dataCriacao: "2025-08-20",
  },
];

export function GestaoUtilizadores() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "todos">("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    role: "condomino" as UserRole,
    fracao: "",
    ativo: true,
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fracao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "todos" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            <Shield className="h-3 w-3 mr-1" />
            {ROLE_LABELS[role]}
          </Badge>
        );
      case "condomino":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Key className="h-3 w-3 mr-1" />
            {ROLE_LABELS[role]}
          </Badge>
        );
      case "arrendatario":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            {ROLE_LABELS[role]}
          </Badge>
        );
    }
  };

  const handleAddUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      ...formData,
      dataCriacao: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id ? { ...user, ...formData } : user
      )
    );
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Tem a certeza que deseja eliminar este utilizador?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleToggleActive = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, ativo: !user.ativo } : user
      )
    );
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || "",
      role: user.role,
      fracao: user.fracao || "",
      ativo: user.ativo,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      role: "condomino",
      fracao: "",
      ativo: true,
    });
  };

  const roleStats = {
    owner: users.filter((u) => u.role === "owner").length,
    condomino: users.filter((u) => u.role === "condomino").length,
    arrendatario: users.filter((u) => u.role === "arrendatario").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Gestão de Utilizadores
          </h1>
          <p className="text-gray-600 mt-1">
            {users.length} utilizadores registados
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Utilizador
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Administradores</span>
          </div>
          <p className="text-2xl font-semibold text-purple-900">
            {roleStats.owner}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Key className="h-5 w-5" />
            <span className="text-sm font-medium">Condóminos</span>
          </div>
          <p className="text-2xl font-semibold text-blue-900">
            {roleStats.condomino}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Arrendatários</span>
          </div>
          <p className="text-2xl font-semibold text-green-900">
            {roleStats.arrendatario}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar por nome, email ou fração..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterRole === "todos" ? "default" : "outline"}
            onClick={() => setFilterRole("todos")}
            className={filterRole === "todos" ? "bg-blue-600" : ""}
          >
            Todos
          </Button>
          <Button
            variant={filterRole === "owner" ? "default" : "outline"}
            onClick={() => setFilterRole("owner")}
            className={filterRole === "owner" ? "bg-purple-600" : ""}
          >
            Admin
          </Button>
          <Button
            variant={filterRole === "condomino" ? "default" : "outline"}
            onClick={() => setFilterRole("condomino")}
            className={filterRole === "condomino" ? "bg-blue-600" : ""}
          >
            Condóminos
          </Button>
          <Button
            variant={filterRole === "arrendatario" ? "default" : "outline"}
            onClick={() => setFilterRole("arrendatario")}
            className={filterRole === "arrendatario" ? "bg-green-600" : ""}
          >
            Arrendatários
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilizador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Criação
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.nome}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.telefone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.fracao || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.ativo}
                        onCheckedChange={() => handleToggleActive(user.id)}
                      />
                      {user.ativo ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(user.dataCriacao).toLocaleDateString("pt-PT")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {user.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.nome}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fração:</span>
                  <span className="text-gray-900">{user.fracao || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  {user.ativo ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(user)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo utilizador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Dono do Condomínio</SelectItem>
                  <SelectItem value="condomino">Condómino</SelectItem>
                  <SelectItem value="arrendatario">Arrendatário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fracao">Fração</Label>
              <Input
                id="fracao"
                value={formData.fracao}
                onChange={(e) =>
                  setFormData({ ...formData, fracao: e.target.value })
                }
                placeholder="ex: 1A"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
            <DialogDescription>
              Altere os dados do utilizador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-nome">Nome Completo</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input
                id="edit-telefone"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Dono do Condomínio</SelectItem>
                  <SelectItem value="condomino">Condómino</SelectItem>
                  <SelectItem value="arrendatario">Arrendatário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-fracao">Fração</Label>
              <Input
                id="edit-fracao"
                value={formData.fracao}
                onChange={(e) =>
                  setFormData({ ...formData, fracao: e.target.value })
                }
                placeholder="ex: 1A"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditUser}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Info */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Hierarquia de Permissões
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Dono do Condomínio
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Gestão de utilizadores</li>
              <li>✓ Gestão financeira completa</li>
              <li>✓ Gestão de obras</li>
              <li>✓ Gestão de reservas</li>
              <li>✓ Acesso ao dashboard</li>
              <li>✓ Sistema de segurança</li>
              <li>✓ Visão 3D do condomínio</li>
              <li>✓ Chat</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Condómino
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Votação em obras</li>
              <li>✓ Reserva de espaços</li>
              <li>✓ Visualizar financeiro</li>
              <li>✓ Sistema de segurança</li>
              <li>✓ Visão 3D do condomínio</li>
              <li>✓ Chat</li>
              <li>✗ Gestão de utilizadores</li>
              <li>✗ Dashboard admin</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Arrendatário
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Reserva de espaços</li>
              <li>✓ Visão 3D do condomínio</li>
              <li>✓ Chat</li>
              <li>✗ Votação em obras</li>
              <li>✗ Visualizar financeiro</li>
              <li>✗ Sistema de segurança</li>
              <li>✗ Gestão de utilizadores</li>
              <li>✗ Dashboard admin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}