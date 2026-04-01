import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Save, Camera, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type User } from "@shared/schema";
import { useUpdateUser } from "@/hooks/use-condominium";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserPerfil() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      password: user?.password || "",
      unit: user?.unit || "",
      avatar: user?.avatar || "",
    },
  });

  const onSubmit = (data: any) => {
    if (!user) return;
    updateUser.mutate({ id: user.id, ...data }, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Perfil atualizado com sucesso." });
      },
      onError: () => {
        toast({ title: "Erro", description: "Falha ao atualizar perfil.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-display font-bold">O Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gira as suas informações pessoais e contactos.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 border-none shadow-xl shadow-black/5 ring-1 ring-border/50">
          <div className="flex flex-col items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary text-white text-4xl font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
                <input 
                  type="text" 
                  className="hidden" 
                  placeholder="URL da Imagem"
                  onChange={(e) => {
                    const url = prompt("Insira o URL da imagem de perfil:");
                    if (url) {
                      setAvatarUrl(url);
                      form.setValue("avatar", url);
                    }
                  }} 
                />
              </label>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold font-display">{user?.name}</h2>
              <p className="text-primary font-medium mt-1">Fração {user?.unit || "Admin"}</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input {...form.register("name")} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Email / Utilizador</Label>
                <Input {...form.register("username")} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <div className="relative">
                  <Input type="password" {...form.register("password")} className="h-12 pl-10" />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Fração</Label>
                <Input {...form.register("unit")} disabled className="h-12 bg-muted/50 opacity-70" />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" className="shadow-lg shadow-primary/20 h-11 px-8" disabled={updateUser.isPending}>
                {updateUser.isPending ? "A guardar..." : "Guardar Alterações"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
