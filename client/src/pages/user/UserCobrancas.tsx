import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useUsers, usePayments, useCreatePayment, useUpdatePayment,
  usePaymentSchedules, useCreatePaymentSchedule, useDeletePaymentSchedule,
} from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema, insertPaymentScheduleSchema, type InsertPayment, type InsertPaymentSchedule } from "@shared/schema";
import { format, isBefore } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  SendIcon, RepeatIcon, Trash2, CheckCircle2, Clock,
  AlertCircle, Users, Euro, Plus, ChevronDown, ChevronUp,
} from "lucide-react";

export function UserCobrancas() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const { data: payments } = usePayments();
  const { data: schedules } = usePaymentSchedules();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const createSchedule = useCreatePaymentSchedule();
  const deleteSchedule = useDeletePaymentSchedule();
  const { toast } = useToast();

  const [dialog, setDialog] = useState<"single" | "recurring" | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const myTenants = users?.filter(u => u.relatedCondominoId === user?.id) || [];
  const mySchedules = schedules?.filter(s => s.condominoId === user?.id) || [];

  const tenantPayments = (tenantId: number) =>
    (payments || []).filter(p => p.userId === tenantId);

  const openDialog = (type: "single" | "recurring", tenantId: number) => {
    setSelectedTenant(tenantId);
    setDialog(type);
    singleForm.reset({ userId: tenantId, description: "", amount: "0", status: "pending", dueDate: new Date() });
    recurringForm.reset({ condominoId: user?.id || 0, tenantId, dayOfMonth: 5, amount: "0", description: "", active: true });
  };

  const singleForm = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: { userId: 0, description: "", amount: "0", status: "pending", dueDate: new Date() },
  });

  const recurringForm = useForm<InsertPaymentSchedule>({
    resolver: zodResolver(insertPaymentScheduleSchema),
    defaultValues: { condominoId: user?.id || 0, tenantId: 0, dayOfMonth: 5, amount: "0", description: "", active: true },
  });

  const onSubmitSingle = (data: InsertPayment) => {
    createPayment.mutate(data, {
      onSuccess: () => {
        toast({ title: "Cobrança criada", description: "Aviso de pagamento enviado ao arrendatário." });
        setDialog(null);
      },
    });
  };

  const onSubmitRecurring = (data: InsertPaymentSchedule) => {
    createSchedule.mutate({ ...data, condominoId: user?.id || 0 }, {
      onSuccess: () => {
        toast({ title: "Agendamento criado", description: "Cobrança periódica configurada com sucesso." });
        setDialog(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteSchedule.mutate(id, {
      onSuccess: () => toast({ title: "Agendamento removido" }),
    });
  };

  const getStatusBadge = (status: string, dueDate: string | Date) => {
    const overdue = status === "pending" && isBefore(new Date(dueDate), new Date());
    if (status === "paid") return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Pago</Badge>;
    if (overdue) return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs"><AlertCircle className="w-3 h-3 mr-1" />Em Atraso</Badge>;
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  if (myTenants.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Cobranças</h1>
          <p className="text-muted-foreground mt-1">Gerencie cobranças aos seus arrendatários.</p>
        </div>
        <Card className="p-16 text-center border-dashed">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-bold text-lg text-muted-foreground">Sem arrendatários associados</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Quando tiver arrendatários na sua fração, poderá gerir cobranças aqui.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Cobranças</h1>
          <p className="text-muted-foreground mt-1">Crie e gira cobranças para os seus arrendatários.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <div className="bg-secondary/50 px-3 py-1.5 rounded-lg text-muted-foreground">
            <span className="font-bold text-foreground">{myTenants.length}</span> arrendatário{myTenants.length > 1 ? "s" : ""}
          </div>
          <div className="bg-secondary/50 px-3 py-1.5 rounded-lg text-muted-foreground">
            <span className="font-bold text-foreground">{mySchedules.length}</span> agendamento{mySchedules.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <Tabs defaultValue="arrendatarios">
        <TabsList className="mb-6">
          <TabsTrigger value="arrendatarios"><Users className="w-4 h-4 mr-2" />Arrendatários</TabsTrigger>
          <TabsTrigger value="agendamentos"><RepeatIcon className="w-4 h-4 mr-2" />Agendamentos Periódicos</TabsTrigger>
        </TabsList>

        {/* --- ABA ARRENDATÁRIOS --- */}
        <TabsContent value="arrendatarios" className="space-y-4">
          {myTenants.map((tenant, idx) => {
            const tp = tenantPayments(tenant.id);
            const pending = tp.filter(p => p.status === "pending");
            const overdue = pending.filter(p => isBefore(new Date(p.dueDate), new Date()));
            const paid = tp.filter(p => p.status === "paid");
            const totalPending = pending.reduce((acc, p) => acc + Number(p.amount), 0);
            const isExpanded = expanded === tenant.id;

            return (
              <motion.div key={tenant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="overflow-hidden border-border/60">
                  {/* Header do arrendatário */}
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">Fração {tenant.unit} · {tenant.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {overdue.length > 0 && (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200">
                          <AlertCircle className="w-3 h-3 mr-1" />{overdue.length} em atraso
                        </Badge>
                      )}
                      {pending.length > 0 && (
                        <span className="text-sm font-bold text-amber-600">€{totalPending.toFixed(2)} pendente</span>
                      )}
                      {pending.length === 0 && paid.length === 0 && (
                        <span className="text-xs text-muted-foreground">Sem cobranças</span>
                      )}
                      <div className="flex gap-2 ml-auto sm:ml-0">
                        <Button variant="outline" size="sm" onClick={() => openDialog("single", tenant.id)}>
                          <SendIcon className="w-3.5 h-3.5 mr-1.5" /> Única
                        </Button>
                        <Button size="sm" onClick={() => openDialog("recurring", tenant.id)}>
                          <RepeatIcon className="w-3.5 h-3.5 mr-1.5" /> Periódica
                        </Button>
                        {tp.length > 0 && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(isExpanded ? null : tenant.id)}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {isExpanded && tp.length > 0 && (
                    <div className="border-t border-border/50 divide-y divide-border/30">
                      {[...pending, ...paid].map(p => {
                        const isOverdue = p.status === "pending" && isBefore(new Date(p.dueDate), new Date());
                        return (
                          <div key={p.id} className={`px-5 py-3 flex items-center justify-between ${isOverdue ? "bg-rose-50/30" : ""}`}>
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-sm">{p.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {p.status === "paid"
                                    ? `Pago · vencimento ${format(new Date(p.dueDate), "dd MMM yyyy", { locale: ptBR })}`
                                    : `Vence ${format(new Date(p.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm">€{Number(p.amount).toFixed(2)}</span>
                              {getStatusBadge(p.status, p.dueDate)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Agendamentos periódicos deste arrendatário */}
                  {mySchedules.filter(s => s.tenantId === tenant.id && s.active).length > 0 && (
                    <div className="px-5 py-3 bg-blue-50/40 border-t border-blue-100 flex flex-wrap gap-2">
                      {mySchedules.filter(s => s.tenantId === tenant.id && s.active).map(s => (
                        <div key={s.id} className="flex items-center gap-2 bg-white border border-blue-200 rounded-full px-3 py-1 text-xs text-blue-700 font-medium">
                          <RepeatIcon className="w-3 h-3" />
                          {s.description} · €{s.amount}/mês · dia {s.dayOfMonth}
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="ml-1 text-blue-400 hover:text-rose-500 transition-colors"
                            title="Remover agendamento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* --- ABA AGENDAMENTOS --- */}
        <TabsContent value="agendamentos">
          {mySchedules.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <RepeatIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-bold text-muted-foreground">Sem agendamentos periódicos</p>
              <p className="text-sm text-muted-foreground/60 mt-2 mb-6">
                Crie agendamentos para cobranças automáticas mensais.
              </p>
              <Button onClick={() => { setSelectedTenant(myTenants[0]?.id); setDialog("recurring"); }}>
                <Plus className="w-4 h-4 mr-2" /> Criar Agendamento
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {mySchedules.map((s, i) => {
                const tenant = users?.find(u => u.id === s.tenantId);
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <RepeatIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold">{s.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Para {tenant?.name || "—"} · todos os dias <span className="font-bold text-foreground">{s.dayOfMonth}</span> do mês
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="font-bold text-lg flex items-center gap-0.5"><Euro className="w-4 h-4" />{Number(s.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">por mês</p>
                        </div>
                        <Badge className={s.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-secondary text-muted-foreground"}>
                          {s.active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Cobrança Única */}
      <Dialog open={dialog === "single"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SendIcon className="w-5 h-5 text-primary" /> Nova Cobrança Única
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Para: <strong>{users?.find(u => u.id === selectedTenant)?.name}</strong>
          </p>
          <Form {...singleForm}>
            <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-4 pt-2">
              <FormField control={singleForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Input placeholder="Ex: Renda Junho 2026" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={singleForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (€)</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={singleForm.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Limite</FormLabel>
                    <FormControl><Input type="date" onChange={(e) => field.onChange(new Date(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full" disabled={createPayment.isPending}>
                {createPayment.isPending ? "A enviar..." : "Enviar Cobrança"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Cobrança Periódica */}
      <Dialog open={dialog === "recurring"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RepeatIcon className="w-5 h-5 text-primary" /> Nova Cobrança Periódica
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Para: <strong>{users?.find(u => u.id === selectedTenant)?.name}</strong>
          </p>
          <Form {...recurringForm}>
            <form onSubmit={recurringForm.handleSubmit(onSubmitRecurring)} className="space-y-4 pt-2">
              <FormField control={recurringForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Input placeholder="Ex: Renda Mensal" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={recurringForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mensal (€)</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={recurringForm.control} name="dayOfMonth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Mês</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Dia" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                          <SelectItem key={d} value={d.toString()}>Dia {d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 flex items-start gap-2">
                <RepeatIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>O arrendatário verá este valor como dívida recorrente todos os meses no dia definido.</span>
              </div>
              <Button type="submit" className="w-full" disabled={createSchedule.isPending}>
                {createSchedule.isPending ? "A criar..." : "Criar Agendamento"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
