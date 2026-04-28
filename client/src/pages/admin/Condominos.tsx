import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Edit, Plus, Trash2, Key } from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser, type User } from "@/shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Condominos() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const residents = users?.filter(u => u.username !== 'admin') || [];

  const form = useForm<InsertUser & { userType?: string; relatedCondominoId?: number }>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      unit: "",
      role: "user",
      userType: "condomino",
      relatedCondominoId: undefined,
    },
  });

  const onSubmit = (data: any) => {
    if (data.userType === "arrendatario" && !data.relatedCondominoId) {
      toast({ title: "Erro", description: "Selecione o cond�mino associado ao arrendat�rio.", variant: "destructive" });
      return;
    }
    if (data.userType === "gestor") data.role = "admin";
    else data.role = "user";
    if (!data.username || !data.password || !data.name || !data.unit) {
      toast({ title: "Erro", description: "Todos os campos são obrigatórios.", variant: "destructive" });
      return;
    }
    
    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, ...data }, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Condómino atualizado." });
          setOpen(false);
          setEditingUser(null);
          form.reset();
        }
      });
    } else {
      createUser.mutate(data, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Condómino adicionado." });
          setOpen(false);
          form.reset();
        }
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      username: user.username,
      password: user.password,
      unit: user.unit || "",
      role: user.role,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem a certeza que deseja eliminar este condómino?")) {
      deleteUser.mutate(id, {
        onSuccess: () => toast({ title: "Sucesso", description: "Condómino eliminado." })
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Condóminos</h1>
          <p className="text-muted-foreground mt-1">Lista de residentes e frações.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Condómino
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Condómino</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fração</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 101A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do condómino" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email / Utilizador</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palavra-passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Utilizador</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gestor">Gestor de Condomínio</SelectItem>
                          <SelectItem value="condomino">Condómino</SelectItem>
                          <SelectItem value="arrendatario">Arrendatario</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("userType") === "arrendatario" && (
                  <FormField
                    control={form.control}
                    name="relatedCondominoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condómino Associado</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o condómino" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {residents.map(u => (
                              <SelectItem key={u.id} value={u.id.toString()}>{u.unit} - {u.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit" className="w-full" disabled={createUser.isPending || updateUser.isPending}>
                  {createUser.isPending || updateUser.isPending ? "A guardar..." : editingUser ? "Atualizar Utilizador" : "Guardar Utilizador"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border/50">
                <TableHead>Fração</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">A carregar...</TableCell>
                </TableRow>
              ) : residents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum condómino encontrado.</TableCell>
                </TableRow>
              ) : (
                residents.map((user) => (
                  <TableRow key={user.id} className="group border-border/50 hover:bg-secondary/20">
                    <TableCell className="font-bold text-primary">{user.unit}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.username}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 w-fit">Ativo</Badge>
                        {user.userType === 'gestor' && <Badge className="bg-purple-50 text-purple-600 border-purple-200 w-fit">Gestor</Badge>}
                        {user.userType === 'arrendatario' && <Badge className="bg-blue-50 text-blue-600 border-blue-200 w-fit">Arrendatario</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"><Phone className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(user)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-700" onClick={() => handleDelete(user.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  );
}
