import { usePayments, useUpdatePayment, useUsers, useCreatePayment, usePaymentSchedules } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, CheckCircle2, Clock, AlertCircle, Plus, Users, RepeatIcon, Flame } from "lucide-react";
import { format, addMonths, setDate, isBefore } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema, type InsertPayment } from "@/shared/schema";
import { useState } from "react";
import { motion } from "framer-motion";

export function UserPagamentos() {
  const { user } = useAuth();
  const { data: payments } = usePayments();
  const { data: users } = useUsers();
  const { data: schedules } = usePaymentSchedules();
  const { mutate: updatePayment, isPending } = useUpdatePayment();
  const createPayment = useCreatePayment();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const isProprietário = user?.userType === "Proprietário" || user?.userType === "administrador";
  const isArrendatário = user?.userType === "Arrendatário";

  const myPayments = payments?.filter(p => p.userId === user?.id) || [];
  const myTenants = users?.filter(u => u.relatedProprietárioId === user?.id) || [];
  const tenantPayments = (tenantId: number) => payments?.filter(p => p.userId === tenantId) || [];

  // Dívidas: pagamentos pendentes do arrendatário separados por em atraso / a vencer
  const overduePayments = myPayments.filter(p => p.status === "pending" && isBefore(new Date(p.dueDate), new Date()));
  const upcomingPayments = myPayments.filter(p => p.status === "pending" && !isBefore(new Date(p.dueDate), new Date()));

  // Agendamentos mensais que afetam este arrendatário
  const mySchedules = schedules?.filter(s => s.tenantId === user?.id && s.active) || [];

  // Calcular próximas datas dos agendamentos (próximos 3 meses)
  const scheduledItems = mySchedules.flatMap(s => {
    const items = [];
    const today = new Date();
    for (let m = 0; m < 3; m++) {
      const baseDate = addMonths(today, m);
      const dueDate = setDate(baseDate, s.dayOfMonth);
      if (dueDate > today) {
        items.push({ ...s, dueDate, isScheduled: true });
      }
    }
    return items;
  });

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: { userId: 0, description: "", amount: "0", status: "pending", dueDate: new Date() },
  });

  const onSubmit = (data: InsertPayment) => {
    createPayment.mutate(data, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Aviso de pagamento criado." });
        setOpen(false);
        form.reset();
      },
    });
  };

  const handlePay = (id: number) => {
    updatePayment({ id, status: "paid" }, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Pagamento registado com sucesso." });
      },
    });
  };

  const getStatusBadge = (status: string, dueDate: string | Date) => {
    const isOverdue = status === "pending" && isBefore(new Date(dueDate), new Date());
    if (status === "paid") return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1"/>Pago</Badge>;
    if (isOverdue) return <Badge className="bg-rose-50 text-rose-600 border-rose-200"><AlertCircle className="w-3 h-3 mr-1"/>Em Atraso</Badge>;
    return <Badge className="bg-amber-50 text-amber-600 border-amber-200"><Clock className="w-3 h-3 mr-1"/>Pendente</Badge>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Pagamentos</h1>
        <p className="text-muted-foreground mt-1">Gestão de quotas e avisos de pagamento.</p>
      </div>

      <Tabs defaultValue={isArrendatário ? "dividas" : "meus"} className="w-full">
        <TabsList className="mb-6">
          {isArrendatário && (
            <TabsTrigger value="dividas" className="relative">
              <Flame className="w-4 h-4 mr-2" />
              Dívidas
              {overduePayments.length > 0 && (
                <span className="ml-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {overduePayments.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="meus">Os Meus Pagamentos</TabsTrigger>
          {isProprietário && myTenants.length > 0 && (
            <TabsTrigger value="Arrendatários">
              <Users className="w-4 h-4 mr-2" />
              Arrendatários ({myTenants.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* --- Dívidas (só arrendatários) --- */}
        {isArrendatário && (
          <TabsContent value="dividas" className="space-y-6">
            {/* Em atraso */}
            {overduePayments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-rose-700">Em Atraso ({overduePayments.length})</h3>
                </div>
                <div className="space-y-3">
                  {overduePayments
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map(p => (
                      <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <Card className="p-4 border-2 border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold">{p.description}</p>
                              <p className="text-sm text-rose-600 font-medium">
                                Venceu a {format(new Date(p.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <p className="font-bold text-xl text-rose-700">€{p.amount}</p>
                            <Button
                              size="sm"
                              className="bg-rose-600 hover:bg-rose-700"
                              onClick={() => handlePay(p.id)}
                              disabled={isPending}
                            >
                              Pagar Agora
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* A pagar (pendentes futuros) */}
            {upcomingPayments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-amber-700">A Pagar ({upcomingPayments.length})</h3>
                </div>
                <div className="space-y-3">
                  {upcomingPayments
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map(p => (
                      <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <Card className="p-4 border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold">{p.description}</p>
                              <p className="text-sm text-muted-foreground">
                                Vence a {format(new Date(p.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <p className="font-bold text-xl">€{p.amount}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePay(p.id)}
                              disabled={isPending}
                            >
                              Pagar
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Agendamentos futuros (previsão) */}
            {scheduledItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                    <RepeatIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-blue-700">Próximos Pagamentos Agendados</h3>
                </div>
                <div className="space-y-2">
                  {scheduledItems
                    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                    .map((item, i) => (
                      <Card key={i} className="p-3 flex items-center justify-between border-blue-100 bg-blue-50/20">
                        <div className="flex items-center gap-3">
                          <RepeatIcon className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{item.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(item.dueDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">€{item.amount}</p>
                          <Badge className="text-xs bg-blue-50 text-blue-600 border-blue-200">Agendado</Badge>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {overduePayments.length === 0 && upcomingPayments.length === 0 && scheduledItems.length === 0 && (
              <Card className="p-10 text-center border-dashed">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="font-bold text-lg">Sem dívidas!</p>
                <p className="text-muted-foreground text-sm mt-1">Está em dia com todos os pagamentos.</p>
              </Card>
            )}
          </TabsContent>
        )}

        {/* --- Meus Pagamentos --- */}
        <TabsContent value="meus">
          {myPayments.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-border/70">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-bold text-lg">Sem pagamentos registados</p>
              <p className="text-muted-foreground text-sm mt-1">Não tem avisos de pagamento.</p>
            </Card>
          ) : (
            <>
              {myPayments.filter(p => p.status === "pending").length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {myPayments.filter(p => p.status === "pending").map(p => {
                    const isOverdue = isBefore(new Date(p.dueDate), new Date());
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className={`p-6 relative overflow-hidden shadow-sm border-2 ${isOverdue ? "border-rose-200 bg-rose-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                          <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard className="w-16 h-16" /></div>
                          <Badge variant="outline" className={`mb-4 inline-flex items-center gap-1 ${isOverdue ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                            {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {isOverdue ? "Em Atraso" : "A Pagamento"}
                          </Badge>
                          <h3 className="text-2xl font-bold mb-1">€{p.amount}</h3>
                          <p className="font-medium text-foreground/80 mb-1">{p.description}</p>
                          <p className="text-sm text-muted-foreground mb-6">Vence: {format(new Date(p.dueDate), "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
                          <div className="space-y-2 mb-6 bg-white/70 p-3 rounded-lg border border-border/50 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Entidade:</span><span className="font-mono font-bold">12345</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Referência:</span><span className="font-mono font-bold">123 456 789</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Valor:</span><span className="font-mono font-bold">€{p.amount}</span></div>
                          </div>
                          <Button className={`w-full ${isOverdue ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"}`} onClick={() => handlePay(p.id)} disabled={isPending}>
                            {isPending ? "A processar..." : "Pagar com MBWay"}
                          </Button>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              {myPayments.filter(p => p.status === "paid").length > 0 && (
                <>
                  <h3 className="text-xl font-bold font-display mb-4">Histórico</h3>
                  <div className="space-y-3">
                    {myPayments.filter(p => p.status === "paid").map(p => (
                      <Card key={p.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold">{p.description}</p>
                            <p className="text-sm text-muted-foreground">Pago a {format(new Date(p.dueDate), "dd MMM yyyy", { locale: ptBR })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                          <p className="font-bold text-lg">€{p.amount}</p>
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Download className="w-4 h-4 mr-2" /> Fatura
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

        {/* --- Arrendatários (Proprietários) --- */}
        {isProprietário && myTenants.length > 0 && (
          <TabsContent value="Arrendatários" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground text-sm">Acompanhe e crie avisos para os seus arrendatários.</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Novo Aviso</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Criar Aviso de Pagamento</DialogTitle></DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField control={form.control} name="userId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Arrendatário</FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                            <SelectContent>{myTenants.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Ex: Renda Mensal - Junho" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="amount" render={({ field }) => (
                        <FormItem><FormLabel>Valor (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="dueDate" render={({ field }) => (
                        <FormItem><FormLabel>Data Limite</FormLabel><FormControl><Input type="date" onChange={(e) => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createPayment.isPending}>
                        {createPayment.isPending ? "A criar..." : "Criar Aviso"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            {myTenants.map(tenant => {
              const tPayments = tenantPayments(tenant.id);
              const pendingCount = tPayments.filter(p => p.status === "pending").length;
              const overdueCount = tPayments.filter(p => p.status === "pending" && isBefore(new Date(p.dueDate), new Date())).length;
              return (
                <Card key={tenant.id} className="overflow-hidden border-border/50">
                  <div className="p-4 bg-secondary/30 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{tenant.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-sm">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">Fração {tenant.unit}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {overdueCount > 0 && <Badge className="bg-rose-50 text-rose-600 border-rose-200">{overdueCount} em atraso</Badge>}
                      {pendingCount > overdueCount && <Badge className="bg-amber-50 text-amber-600 border-amber-200">{pendingCount - overdueCount} pendente{pendingCount - overdueCount > 1 ? "s" : ""}</Badge>}
                    </div>
                  </div>
                  {tPayments.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">Sem avisos de pagamento.</div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {tPayments.map(p => (
                        <div key={p.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{p.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(p.dueDate), "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">€{p.amount}</span>
                            {getStatusBadge(p.status, p.dueDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
