import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Save } from "lucide-react";
import { motion } from "framer-motion";

export function UserPerfil() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">O Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gira as suas informações pessoais e contactos.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 border-none shadow-xl shadow-black/5 ring-1 ring-border/50">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-inner">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">{user?.name}</h2>
              <p className="text-primary font-medium mt-1">Fração {user?.unit}</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue={user?.name} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={`${user?.username}@exemplo.com`} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="912 345 678" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Fração</Label>
                <Input id="unit" defaultValue={user?.unit} disabled className="h-12 bg-muted/50 opacity-70" />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" className="shadow-lg shadow-primary/20 h-11 px-8">
                <Save className="w-4 h-4 mr-2" /> Guardar Alterações
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
