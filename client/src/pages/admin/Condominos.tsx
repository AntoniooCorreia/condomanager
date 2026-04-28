import { useUsers, useCreateUser, useDeleteUser, useUpdateUser, usePayments, useReservations, usePaymentSchedules } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Edit, Plus, Trash2, Users, Home, AlertCircle, CheckCircle2, Clock, Calendar, RepeatIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser, type User } from "@/shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Condominos() {
  const { data: users, isLoading } = useUsers();
  const { data: payments } = usePayments();
  const { data: reservations } = useReservations();
  const { data: schedules } = usePaymentSchedules();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<User | null>(null);

  const residents = users?.filter(u => u.username !== "admin" && u.userType !== "arrendatario") || [];
  const arrendatarios = users?.filter(u => u.userType === "arrendatario") || [];

  const form = useForm<InsertUser & { userType?: string; relatedCondominoId?: number }>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { name: "", username: "", password: "", unit: "", role: "user", userType: "condomino", relatedCondominoId: undefined },
  });

  const onSubmit = (data: any) => {
    if (data.userType === "arrendatario" && !data.relatedCondominoId) {
      toast({ title: "Erro", description: "Selecione o condómino associado ao arrendatário.", variant: "destructive" });
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
        onSuccess: () => { toast({ title: "Sucesso", description: "Utilizador atualizado." }); setOpen(false); setEditingUser(null); form.reset(); }
      });
    } else {
      createUser.mutate(data, {
        onSuccess: () => { toast({ title: "Sucesso", description: "Utilizador adicionado." }); setOpen(false); form.reset(); }
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({ name: user.name, username: user.username, password: user.password, unit: user.unit || "", role: user.role });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem a certeza que deseja eliminar este utilizador?")) {
      deleteUser.mutate(id, { onSuccess: () => toast({ title: "Sucesso", description: "Utilizador eliminado." }) });
    }
  };

  const getTenantStats = (tenantId: number) => {
    const tenantPayments = payments?.filter(p => p.userId === tenantId) || [];
    const pending = tenantPayments.filter(p => p.status === "pending");
    const overdue = pending.filter(p => isBefore(new Date(p.dueDate), new Date()));
    const paid = tenantPayments.filter(p => p.status === "paid");
    const nextPayment = pending.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    const nextReservation = reservations?.filter(r => r.userId === tenantId && new Date(r.date) >= new Date() && r.status === "approved").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    const tenantSchedules = schedules?.filter(s => s.tenantId === tenantId && s.active) || [];
    return { pending, overdue, paid, nextPayment, nextReservation, tenantSchedules };
  };

  const DialogForm = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2" />Adicionar Utilizador</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{editingUser ? "Editar Utilizador" : "Novo Utilizador"}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem><FormLabel>Fração</FormLabel><FormControl><Input placeholder="Ex: 101A" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Nome" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem><FormLabel>Email / Utilizador</FormLabel><FormControl><Input placeholder="email@exemplo.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>Palavra-passe</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="userType" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Utilizador</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="gestor">Gestor de Condomínio</SelectItem>
                    <SelectItem value="condomino">Condómino</SelectItem>
                    <SelectItem value="arrendatario">Arrendatário</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {form.watch("userType") === "arrendatario" && (
              <FormField control={form.control} name="relatedCondominoId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Condómino Associado</FormLabel>
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o condómino" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {residents.filter(u => u.userType === "condomino").map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>{u.unit} - {u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <Button type="submit" className="w-full" disabled={createUser.isPending || updateUser.isPending}>
              {createUser.isPending || updateUser.isPending ? "A guardar..." : editingUser ? "Atualizar" : "Guardar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Condóminos</h1>
          <p className="text-muted-foreground mt-1">Gestão de residentes e arrendatários.</p>
        </div>
        <DialogForm />
      </div>

      <Tabs defaultValue="condominos">
        <TabsList className="mb-6">
          <TabsTrigger value="condominos"><Home className="w-4 h-4 mr-2" />Condóminos ({residents.length})</TabsTrigger>
          <TabsTrigger value="arrendatarios"><Users className="w-4 h-4 mr-2" />Arrendatários ({arrendatarios.length})</TabsTrigger>
        </TabsList>

        {/* ABA CONDÓMINOS */}
        <TabsContent value="condominos">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border/50">
                    <TableHead>Fração</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">A carregar...</TableCell></TableRow>
                  ) : residents.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum condómino encontrado.</TableCell></TableRow>
                  ) : residents.map((user) => (
                    <TableRow key={user.id} className="group border-border/50 hover:bg-secondary/20">
                      <TableCell className="font-bold text-primary">{user.unit}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.username}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 w-fit">Ativo</Badge>
                          {user.userType === "gestor" && <Badge className="bg-purple-50 text-purple-600 border-purple-200 w-fit">Gestor</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(user)}><Edit className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-700" onClick={() => handleDelete(user.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ABA ARRENDATÁRIOS */}
        <TabsContent value="arrendatarios">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista */}
            <div className="space-y-3">
              {arrendatarios.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Sem arrendatários</p>
                </Card>
              ) : arrendatarios.map((tenant, i) => {
                const { overdue, pending } = getTenantStats(tenant.id);
                const condominoAssoc = users?.find(u => u.id === Number(tenant.relatedCondominoId));
                return (
                  <motion.div key={tenant.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${selectedTenant?.id === tenant.id ? "border-primary" : "border-transparent"}`}
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {tenant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{tenant.name}</p>
                            <p className="text-xs text-muted-foreground">Fração {tenant.unit}</p>
                            {condominoAssoc && <p className="text-xs text-primary">? {condominoAssoc.name}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {overdue.length > 0 && <Badge className="bg-rose-50 text-rose-600 border-rose-200 text-xs"><AlertCircle className="w-3 h-3 mr-1" />{overdue.length} atraso</Badge>}
                          {pending.length > 0 && overdue.length === 0 && <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-xs"><Clock className="w-3 h-3 mr-1" />{pending.length} pend.</Badge>}
                          {pending.length === 0 && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />OK</Badge>}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Painel de detalhes */}
            <div className="lg:col-span-2">
              {!selectedTenant ? (
                <Card className="p-12 text-center border-dashed h-full flex flex-col items-center justify-center">
                  <Users className="w-16 h-16 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground font-medium">Selecione um arrendatário para ver os detalhes</p>
                </Card>
              ) : (() => {
                const { pending, overdue, paid, nextPayment, nextReservation, tenantSchedules } = getTenantStats(selectedTenant.id);
                const condominoAssoc = users?.find(u => u.id === Number(selectedTenant.relatedCondominoId));
                return (
                  <motion.div key={selectedTenant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Header */}
                    <Card className="p-6 border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                            {selectedTenant.name.charAt(0)}
                          </div>
                          <div>
                            <h2 className="font-display font-bold text-xl">{selectedTenant.name}</h2>
                            <p className="text-muted-foreground text-sm">Fração {selectedTenant.unit} · {selectedTenant.username}</p>
                            {condominoAssoc && <p className="text-xs text-primary mt-1">Condómino: {condominoAssoc.name} (Fração {condominoAssoc.unit})</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(selectedTenant)}><Edit className="w-4 h-4 mr-1" />Editar</Button>
                          <Button size="sm" variant="ghost" className="text-rose-500" onClick={() => handleDelete(selectedTenant.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="p-4 text-center border-rose-100 bg-rose-50/30">
                        <p className="text-2xl font-bold text-rose-600">{overdue.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Em Atraso</p>
                      </Card>
                      <Card className="p-4 text-center border-amber-100 bg-amber-50/30">
                        <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
                      </Card>
                      <Card className="p-4 text-center border-emerald-100 bg-emerald-50/30">
                        <p className="text-2xl font-bold text-emerald-600">{paid.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Pagos</p>
                      </Card>
                    </div>

                    {/* Próximo pagamento */}
                    {nextPayment && (
                      <Card className="p-4 border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Próximo Pagamento</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{nextPayment.description}</p>
                            <p className="text-sm text-muted-foreground">Vence a {format(new Date(nextPayment.dueDate), "dd 'de' MMMM", { locale: ptBR })}</p>
                          </div>
                          <p className="font-bold text-lg text-primary">€{Number(nextPayment.amount).toFixed(2)}</p>
                        </div>
                      </Card>
                    )}

                    {/* Próxima reserva */}
                    {nextReservation && (
                      <Card className="p-4 border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Próxima Reserva</p>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-bold capitalize">{nextReservation.area}</p>
                            <p className="text-sm text-muted-foreground">{format(new Date(nextReservation.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}</p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Agendamentos */}
                    {tenantSchedules.length > 0 && (
                      <Card className="p-4 border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cobranças Periódicas</p>
                        <div className="space-y-2">
                          {tenantSchedules.map(s => (
                            <div key={s.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 text-sm">
                              <div className="flex items-center gap-2 text-blue-700">
                                <RepeatIcon className="w-3 h-3" />
                                <span>{s.description}</span>
                              </div>
                              <span className="font-bold text-blue-700">€{s.amount}/mês · dia {s.dayOfMonth}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Pagamentos em falta */}
                    {overdue.length > 0 && (
                      <Card className="p-4 border-rose-200 bg-rose-50/20">
                        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-3">Pagamentos em Atraso</p>
                        <div className="space-y-2">
                          {overdue.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-sm">
                              <span className="font-medium">{p.description}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-rose-600 font-bold">€{Number(p.amount).toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">venceu {format(new Date(p.dueDate), "dd MMM", { locale: ptBR })}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
