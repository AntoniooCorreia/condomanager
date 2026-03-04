import { useState } from "react";
import { useNavigate } from "react-router";
import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { User, UserRole } from "../types/user";

export function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication - determine role based on email
    let role: UserRole;
    let nome: string;
    let fracao: string | undefined;
    
    if (email.includes("admin") || email.includes("owner")) {
      role = "owner";
      nome = "Admin Condomínio";
      fracao = undefined;
    } else if (email.includes("arrendatario") || email.includes("tenant")) {
      role = "arrendatario";
      nome = "Ana Rodrigues";
      fracao = "2B";
    } else {
      role = "condomino";
      nome = "João Silva";
      fracao = "1A";
    }

    const user: User = {
      id: "1",
      nome,
      email,
      role,
      fracao,
      ativo: true,
      dataCriacao: new Date().toISOString().split("T")[0],
    };

    setCurrentUser(user);

    // Navigate based on role
    if (role === "owner") {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            CondoGest
          </h1>
          <p className="text-gray-600">
            Gestão inteligente do seu condomínio
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {isRegister ? "Criar Conta" : "Entrar"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Lembrar-me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Esqueceu a palavra-passe?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700">
              {isRegister ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isRegister ? "Entrar" : "Criar conta"}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-900 font-medium mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-blue-700">
              Admin: admin@condogest.pt
            </p>
            <p className="text-xs text-blue-700">
              Condómino: user@condogest.pt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}