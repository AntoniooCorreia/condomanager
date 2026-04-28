import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    setLocation(user.role === "admin" || user.role === "administrador" ? "/admin" : "/user");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      // Wait for re-render to handle redirection
    } catch (err: any) {
      toast({
        title: "Erro de autenticação",
        description: err.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-primary relative overflow-hidden items-center justify-center">
        {/* modern architecture building */}
        <img 
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&h=1080&fit=crop" 
          alt="Building" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
        <div className="relative z-10 p-12 text-white max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src="/logoFullpng.png" alt="Logo" className="w-56 mb-8" />
            <h1 className="text-5xl font-display font-bold leading-tight mb-6">
              Gestão inteligente para o seu condomínio.
            </h1>
            <p className="text-primary-foreground/80 text-lg text-balance">
              Transparência, eficiência e comunicação direta entre a administração e os Proprietários.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Login Side */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-8 right-8 text-sm text-muted-foreground hidden lg:block">
          Precisa de ajuda? <a href="#" className="text-primary font-semibold hover:underline">Contacte o suporte</a>
        </div>
        
        <Card className="w-full max-w-md p-8 shadow-2xl border-none ring-1 ring-black/5 bg-white/50 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-foreground">Bem-vindo</h2>
              <p className="text-muted-foreground mt-2">Inicie sessão na sua conta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Utilizador</Label>
                <Input 
                  id="username" 
                  placeholder="ex: admin ou joao.silva" 
                  className="h-12 bg-secondary/50 border-secondary-foreground/10 focus-visible:ring-primary"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Palavra-passe</Label>
                  <a href="#" className="text-xs text-primary font-medium hover:underline">Esqueceu-se?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 bg-secondary/50 border-secondary-foreground/10 focus-visible:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>
          </motion.div>
        </Card>
      </div>
    </div>
  );
}
