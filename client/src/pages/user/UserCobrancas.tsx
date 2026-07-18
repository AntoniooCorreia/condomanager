import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUsers, usePayments, useCreatePayment, useUpdatePayment, usePaymentSchedules, useCreatePaymentSchedule, useDeletePaymentSchedule, useApprovePayment, useRejectPayment } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema, insertPaymentScheduleSchema, type InsertPayment, type InsertPaymentSchedule, type Payment } from "@/shared/schema";
import { format, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendIcon, RepeatIcon, Trash2, CheckCircle2, Clock, AlertCircle, Users, Euro, Plus, ChevronDown, ChevronUp, ExternalLink, XCircle, ShieldCheck } from "lucide-react";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mbway: "MBWay",
  transferencia: "Transferencia Bancaria (NIB)",
  dinheiro: "Dinheiro",
  cheque: "Cheque",
  outro: "Outro",
};

export function UserCobrancas() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const { data: payments } = usePayments();
  const { data: schedules } = usePaymentSchedules();
  const createPayment = useCreatePayment();
  const createSchedule = useCreatePaymentSchedule();
  const deleteSchedule = useDeletePaymentSchedule();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const { toast } = useToast();

  const [dialog, setDialog] = useState<"single" | "recurring" | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const myTenants = users?.filter(u => Number(u.relatedCondominoId) === user?.id) || [];
  const mySchedules = schedules?.filter(s => s.condominoId === user?.id) || [];
  const myTenantIds = myTenants.map(t => t.id);
  const awaitingApproval = (payments || []).filter(p => myTenantIds.includes(p.userId) && p.status === "aguarda_aprovacao");

  const tenantPayments = (tenantId: number) => (payments || []).filter(p => p.userId === tenantId);

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
      onSuccess: () => { toast({ title: "Cobranca criada", description: "Aviso de pagamento enviado ao arrendatario." }); setDialog(null); },
    });
  };

  const onSubmitRecurring = (data: InsertPaymentSchedule) => {
    createSchedule.mutate({ ...data, condominoId: user?.id || 0 }, {
      onSuccess: () => { toast({ title: "Agendamento criado", description: "Cobranca periodica configurada com sucesso." }); setDialog(null); },
    });
  };

  const handleDelete = (id: number) => {
    deleteSchedule.mutate(id, { onSuccess: () => toast({ title: "Agendamento removido" }) });
  };

  const handleApprove = (id: number) => {
    approvePayment.mutate({ id, approvedBy: user?.id }, {
      onSuccess: () => toast({ title: "Pagamento aprovado com sucesso." }),
      onError: (err: any) => toast({ title: "Erro", description: err?.message || "Nao foi possivel aprovar.", variant: "destructive" }),
    });
  };

  const handleReject = () => {
    if (!rejectingPayment) return;
    rejectPayment.mutate({ id: rejectingPayment.id, reason: rejectReason }, {
      onSuccess: () => {
        toast({ title: "Comprovativo rejeitado", description: "O arrendatario tera de reenviar." });
        setRejectingPayment(null);
        setRejectReason("");
      },
      onError: (err: any) => toast({ title: "Erro", description: err?.message || "Nao foi possivel rejeitar.", variant: "destructive" }),
    });
  };

  const getStatusBadge = (status: string, dueDate: string | Date) => {
    const overdue = status === "pending" && isBefore(new Date(dueDate), new Date());
    if (status === "paid") return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Pago</Badge>;
    if (status === "aguarda_aprovacao") return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs"><Clock className="w-3 h-3 mr-1" />Aguarda Aprovacao</Badge>;
    if (status === "rejeitado") return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
    if (overdue) return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs"><AlertCircle className="w-3 h-3 mr-1" />Em Atraso</Badge>;
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  if (myTenants.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Cobrancas</h1>
          <p className="text-muted-foreground mt-1">Gerencie cobrancas aos seus arrendatarios.</p>
        </div>
        <Card className="p-16 text-center border-dashed">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-bold text-lg text-muted-foreground">Sem arrendatarios associados</p>
          <p className="text-sm text-muted-foreground/70 mt-2">Quando tiver arrendatarios na sua fracao, podera gerir cobrancas aqui.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Cobrancas</h1>
          <p className="text-muted-foreground mt-1">Crie e gira cobrancas para os seus arrendatarios.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <div className="bg-secondary/50 px-3 py-1.5 rounded-lg text-muted-foreground">
            <span className="font-bold text-foreground">{myTenants.length}</span> arrendatario{myTenants.length > 1 ? "s" : ""}
          </div>
          <div className="bg-secondary/50 px-3 py-1.5 rounded-lg text-muted-foreground">
            <span className="font-bold text-foreground">{mySchedules.length}</span> agendamento{mySchedules.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {awaitingApproval.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50/40 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><ShieldCheck className="w-4 h-4" /></div>
            <h3 className="font-bold text-blue-800">Comprovativos por Aprovar ({awaitingApproval.length})</h3>
          </div>
          <div className="space-y-3">
            {awaitingApproval.map(p => {
              const tenant = users?.find(u => u.id === p.userId);
              return (
                <Card key={p.id} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-sm">{p.description} — {tenant?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.paymentMethod ? PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod : ""} · Enviado a {p.submittedAt ? format(new Date(p.submittedAt), "dd MMM yyyy, HH:mm", { locale: ptBR }) : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-bold">€{p.amount}</span>
                    {p.proofUrl && (
                      <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> Ver
                      </a>
                    )}
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(p.id)} disabled={approvePayment.isPending}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprovar
                    </Button>
                    <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => { setRejectingPayment(p); setRejectReason(""); }}>
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeitar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      <Tabs defaultValue="arrendatarios">
        <TabsList className="mb-6">
          <TabsTrigger value="arrendatarios"><Users className="w-4 h-4 mr-2" />Arrendatarios</TabsTrigger>
          <TabsTrigger value="agendamentos"><RepeatIcon className="w-4 h-4 mr-2" />Agendamentos Periodicos</TabsTrigger>
        </TabsList>

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
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">{tenant.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">Fracao {tenant.unit} - {tenant.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {overdue.length > 0 && <Badge className="bg-rose-50 text-rose-700 border-rose-200"><AlertCircle className="w-3 h-3 mr-1" />{overdue.length} em atraso</Badge>}
                      {pending.length > 0 && <span className="text-sm font-bold text-amber-600">EUR {totalPending.toFixed(2)} pendente</span>}
                      {pending.length === 0 && paid.length === 0 && <span className="text-xs text-muted-foreground">Sem cobrancas</span>}
                      <div className="flex gap-2 ml-auto sm:ml-0">
                        <Button variant="outline" size="sm" onClick={() => openDialog("single", tenant.id)}><SendIcon className="w-3.5 h-3.5 mr-1.5" /> Unica</Button>
                        <Button size="sm" onClick={() => openDialog("recurring", tenant.id)}><RepeatIcon className="w-3.5 h-3.5 mr-1.5" /> Periodica</Button>
                        {tp.length > 0 && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(isExpanded ? null : tenant.id)}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded && tp.length > 0 && (
                    <div className="border-t border-border/50 divide-y divide-border/30">
                      {[...pending, ...paid].map(p => {
                        const isOverdue = p.status === "pending" && isBefore(new Date(p.dueDate), new Date());
                        return (
                          <div key={p.id} className={`px-5 py-3 flex items-center justify-between ${isOverdue ? "bg-rose-50/30" : ""}`}>
                            <div>
                              <p className="font-medium text-sm">{p.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.status === "paid" ? `Pago - vencimento ${format(new Date(p.dueDate), "dd MMM yyyy", { locale: ptBR })}` : `Vence ${format(new Date(p.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm">EUR {Number(p.amount).toFixed(2)}</span>
                              {getStatusBadge(p.status, p.dueDate)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {mySchedules.filter(s => s.tenantId === tenant.id && s.active).length > 0 && (
                    <div className="px-5 py-3 bg-blue-50/40 border-t border-blue-100 flex flex-wrap gap-2">
                      {mySchedules.filter(s => s.tenantId === tenant.id && s.active).map(s => (
                        <div key={s.id} className="flex items-center gap-2 bg-white border border-blue-200 rounded-full px-3 py-1 text-xs text-blue-700 font-medium">
                          <RepeatIcon className="w-3 h-3" />
                          {s.description} - EUR {s.amount}/mes - dia {s.dayOfMonth}
                          <button onClick={() => handleDelete(s.id)} className="ml-1 text-blue-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="agendamentos">
          {mySchedules.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <RepeatIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-bold text-muted-foreground">Sem agendamentos periodicos</p>
              <p className="text-sm text-muted-foreground/60 mt-2 mb-6">Crie agendamentos para cobrancas automaticas mensais.</p>
              <Button onClick={() => { setSelectedTenant(myTenants[0]?.id); setDialog("recurring"); }}><Plus className="w-4 h-4 mr-2" /> Criar Agendamento</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {mySchedules.map((s, i) => {
                const tenant = users?.find(u => u.id === s.tenantId);
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0"><RepeatIcon className="w-5 h-5" /></div>
                        <div>
                          <p className="font-bold">{s.description}</p>
                          <p className="text-sm text-muted-foreground">Para {tenant?.name || "-"} - todos os dias <span className="font-bold text-foreground">{s.dayOfMonth}</span> do mes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="font-bold text-lg flex items-center gap-0.5"><Euro className="w-4 h-4" />{Number(s.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">por mes</p>
                        </div>
                        <Badge className={s.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-secondary text-muted-foreground"}>{s.active ? "Ativo" : "Inativo"}</Badge>
                        <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialog === "single"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><SendIcon className="w-5 h-5 text-primary" /> Nova Cobranca Unica</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">Para: <strong>{users?.find(u => u.id === selectedTenant)?.name}</strong></p>
          <Form {...singleForm}>
            <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-4 pt-2">
              <FormField control={singleForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descricao</FormLabel><FormControl><Input placeholder="Ex: Renda Junho 2026" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={singleForm.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Valor (EUR)</FormLabel><FormControl><Input type="number" min="0" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={singleForm.control} name="dueDate" render={({ field }) => (
                  <FormItem><FormLabel>Data Limite</FormLabel><FormControl><Input type="date" onChange={(e) => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full" disabled={createPayment.isPending}>{createPayment.isPending ? "A enviar..." : "Enviar Cobranca"}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "recurring"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><RepeatIcon className="w-5 h-5 text-primary" /> Nova Cobranca Periodica</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">Para: <strong>{users?.find(u => u.id === selectedTenant)?.name}</strong></p>
          <Form {...recurringForm}>
            <form onSubmit={recurringForm.handleSubmit(onSubmitRecurring)} className="space-y-4 pt-2">
              <FormField control={recurringForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descricao</FormLabel><FormControl><Input placeholder="Ex: Renda Mensal" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={recurringForm.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Valor Mensal (EUR)</FormLabel><FormControl><Input type="number" min="0" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={recurringForm.control} name="dayOfMonth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Mes</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Dia" /></SelectTrigger></FormControl>
                      <SelectContent>{Array.from({ length: 28 }, (_, i) => i + 1).map(d => (<SelectItem key={d} value={d.toString()}>Dia {d}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full" disabled={createSchedule.isPending}>{createSchedule.isPending ? "A criar..." : "Criar Agendamento"}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectingPayment} onOpenChange={(o) => !o && setRejectingPayment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-rose-600"><XCircle className="w-5 h-5" /> Rejeitar Comprovativo</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">Pagamento: <strong>{rejectingPayment?.description}</strong></p>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Motivo (opcional)</label>
              <Textarea placeholder="Ex: Comprovativo ilegivel, valor nao corresponde, etc." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={handleReject} disabled={rejectPayment.isPending}>
              {rejectPayment.isPending ? "A rejeitar..." : "Confirmar Rejeicao"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}