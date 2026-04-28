import { useAuth } from "@/hooks/use-auth";
import { usePayments, useReservations, useUsers, useCreatePayment, useCreatePaymentSchedule, usePaymentSchedules } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, ArrowRight, Users, Plus, RepeatIcon, SendIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Building2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { insertPaymentSchema, insertPaymentScheduleSchema, type InsertPayment, type InsertPaymentSchedule } from "@/shared/schema";

export function UserHome() {
  const { user } = useAuth();
  const { data: payments } = usePayments();
  const { data: reservations } = useReservations();
  const { data: users } = useUsers();
  const { data: schedules } = usePaymentSchedules();
  const createPayment = useCreatePayment();
  const createSchedule = useCreatePaymentSchedule();
  const { toast } = useToast();
  const [openSingle, setOpenSingle] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);

  const isProprietário = user?.userType === "Proprietário" || user?.userType === "administrador";
  const myTenants = user?.id ? users?.filter(u => u.relatedProprietárioId === user.id) || [] : [];

  const myPayments = payments?.filter(p => p.userId === user?.id) || [];
  const pendingPayment = myPayments.find(p => p.status !== "paid");

  const myNextRes = reservations
    ?.filter(r => r.userId === user?.id && new Date(r.date) >= new Date() && r.status === "approved")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const mySchedules = schedules?.filter(s => s.ProprietárioId === user?.id && s.active) || [];

  const singleForm = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: { userId: 0, description: "", amount: "0", status: "pending", dueDate: new Date() },
  });

  const scheduleForm = useForm<InsertPaymentSchedule>({
    resolver: zodResolver(insertPaymentScheduleSchema),
    defaultValues: { ProprietárioId: user?.id || 0, tenantId: 0, dayOfMonth: 1, amount: "0", description: "", active: true },
  });

  const onSubmitSingle = (data: InsertPayment) => {
    createPayment.mutate(data, {
      onSuccess: () => {
        toast({ title: "Aviso enviado", description: "O arrendatário foi notificado." });
        setOpenSingle(false);
        singleForm.reset();
      },
    });
  };

  const onSubmitSchedule = (data: InsertPaymentSchedule) => {
    createSchedule.mutate({ ...data, ProprietárioId: user?.id || 0 }, {
      onSuccess: () => {
        toast({ title: "Agendamento criado", description: "Os pagamentos mensais foram configurados." });
        setOpenSchedule(false);
        scheduleForm.reset();
      },
    });
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Building2 className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4 backdrop-blur-sm">Fração {user?.unit}</Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Olá, {user?.name.split(" ")[0]}</h1>
          <p className="text-primary-foreground/80 max-w-lg">
            Bem-vindo à área do Proprietário. Aqui pode gerir pagamentos, efetuar reservas e aceder a informações do edifício.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 h-full border-border/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pagamentos</h3>
                <p className="text-sm text-muted-foreground">O seu estado financeiro</p>
              </div>
            </div>
            {pendingPayment ? (
              <div className="bg-secondary/50 rounded-xl p-4 mb-6 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Próximo pagamento:</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-bold text-xl">€{pendingPayment.amount}</p>
                    <p className="text-sm font-medium text-foreground/80">{pendingPayment.description}</p>
                  </div>
                  <p className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded">
                    Vence a {format(new Date(pendingPayment.dueDate), "dd MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="font-bold text-emerald-800">Tudo em dia!</p>
                  <p className="text-sm text-emerald-600">Não tem pagamentos pendentes.</p>
                </div>
              </div>
            )}
            <Link href="/user/pagamentos" className="block w-full">
              <Button variant="outline" className="w-full justify-between hover:bg-secondary">
                Ver Histórico <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 h-full border-border/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Próxima Reserva</h3>
                <p className="text-sm text-muted-foreground">As suas áreas comuns</p>
              </div>
            </div>
            {myNextRes ? (
              <div className="bg-secondary/50 rounded-xl p-4 mb-6 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold capitalize">{myNextRes.area}</p>
                  <Badge className="bg-emerald-500">Aprovada</Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-3 font-medium">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(myNextRes.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                </p>
              </div>
            ) : (
              <div className="bg-secondary/30 rounded-xl p-6 mb-6 text-center border border-border border-dashed">
                <p className="text-muted-foreground font-medium mb-2">Sem reservas agendadas</p>
                <p className="text-sm text-muted-foreground/70">Aproveite a piscina ou o ginásio do edifício.</p>
              </div>
            )}
            <Link href="/user/reservar" className="block w-full">
              <Button variant="outline" className="w-full justify-between hover:bg-secondary">
                Efetuar Reserva <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>

      {/* --- Gestão de Arrendatários (só Proprietários) --- */}
      {isProprietário && myTenants.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Gestão de Arrendatários</h3>
                  <p className="text-sm text-muted-foreground">{myTenants.length} arrendatário{myTenants.length > 1 ? "s" : ""} associado{myTenants.length > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Aviso Único */}
                <Dialog open={openSingle} onOpenChange={setOpenSingle}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SendIcon className="w-4 h-4 mr-2" /> Aviso Único
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enviar Aviso de Pagamento</DialogTitle>
                    </DialogHeader>
                    <Form {...singleForm}>
                      <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-4">
                        <FormField control={singleForm.control} name="userId" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Arrendatário</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {myTenants.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={singleForm.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Input placeholder="Ex: Renda Junho" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={singleForm.control} name="amount" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor (€)</FormLabel>
                            <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
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
                        <Button type="submit" className="w-full" disabled={createPayment.isPending}>
                          {createPayment.isPending ? "A enviar..." : "Enviar Aviso"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Agendamento Mensal */}
                <Dialog open={openSchedule} onOpenChange={setOpenSchedule}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <RepeatIcon className="w-4 h-4 mr-2" /> Agendamento Mensal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Agendamento Mensal</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground -mt-2">O arrendatário receberá um aviso todos os meses no dia definido.</p>
                    <Form {...scheduleForm}>
                      <form onSubmit={scheduleForm.handleSubmit(onSubmitSchedule)} className="space-y-4">
                        <FormField control={scheduleForm.control} name="tenantId" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Arrendatário</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {myTenants.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={scheduleForm.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Input placeholder="Ex: Renda Mensal" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={scheduleForm.control} name="amount" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Mensal (€)</FormLabel>
                            <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={scheduleForm.control} name="dayOfMonth" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dia do Mês para Pagamento</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Dia do mês" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                                  <SelectItem key={d} value={d.toString()}>Dia {d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" className="w-full" disabled={createSchedule.isPending}>
                          {createSchedule.isPending ? "A criar..." : "Criar Agendamento"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Lista de arrendatários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myTenants.map(tenant => {
                const tenantSchedules = mySchedules.filter(s => s.tenantId === tenant.id);
                const tenantPending = payments?.filter(p => p.userId === tenant.id && p.status === "pending").length || 0;
                return (
                  <div key={tenant.id} className="bg-secondary/30 rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">Fração {tenant.unit}</p>
                        </div>
                      </div>
                      {tenantPending > 0 && (
                        <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-xs">{tenantPending} pendente{tenantPending > 1 ? "s" : ""}</Badge>
                      )}
                    </div>
                    {tenantSchedules.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        {tenantSchedules.map(s => (
                          <div key={s.id} className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><RepeatIcon className="w-3 h-3" /> {s.description}</span>
                            <span className="font-medium">€{s.amount}/mês · dia {s.dayOfMonth}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
