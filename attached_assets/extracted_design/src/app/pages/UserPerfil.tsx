import { User, Mail, Phone, Building2, Key, Bell, Shield, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useNavigate } from "react-router";

export function UserPerfil() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Perfil</h1>
        <p className="text-gray-600 mt-1">
          Gerir os seus dados pessoais e preferências
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Informação Pessoal
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                defaultValue="João Silva"
                className="mt-1.5"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="joao.silva@email.com"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                defaultValue="+351 912 345 678"
                className="mt-1.5"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="nif">NIF</Label>
              <Input
                id="nif"
                type="text"
                defaultValue="123456789"
                className="mt-1.5"
              />
            </div>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700">
            Guardar Alterações
          </Button>
        </div>
      </div>

      {/* Property Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Fração Associada
          </h2>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-600 mb-1">Fração</p>
              <p className="text-xl font-semibold text-blue-900">1A</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Edifício</p>
              <p className="text-xl font-semibold text-blue-900">Central</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Permilagem</p>
              <p className="text-xl font-semibold text-blue-900">2.5‰</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Segurança</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password-atual">Palavra-passe Atual</Label>
            <Input
              id="password-atual"
              type="password"
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="password-nova">Nova Palavra-passe</Label>
              <Input
                id="password-nova"
                type="password"
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="password-confirmar">Confirmar Palavra-passe</Label>
              <Input
                id="password-confirmar"
                type="password"
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>
          </div>

          <Button variant="outline">Alterar Palavra-passe</Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Notificações
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Notificações por Email</p>
              <p className="text-sm text-gray-600">
                Receber atualizações sobre pagamentos e obras
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Lembretes de Pagamento</p>
              <p className="text-sm text-gray-600">
                Avisos antes do vencimento da quota mensal
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Novas Propostas de Obras</p>
              <p className="text-sm text-gray-600">
                Ser notificado quando houver novas votações
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Confirmação de Reservas</p>
              <p className="text-sm text-gray-600">
                Receber confirmação de reservas de espaços
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Terminar Sessão
            </h3>
            <p className="text-sm text-gray-600">
              Sair da sua conta CondoGest
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
