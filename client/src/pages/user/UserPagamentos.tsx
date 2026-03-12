import { usePayments, useUpdatePayment, useUsers, useCreatePayment } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, CheckCircle2, Clock, AlertCircle, Plus, Users } from "lucide-react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema, type InsertPayment } from "@shared/schema";
import { useState } from "react";
import { motion } from "framer-motion";

export function UserPagamentos() {
  const { user } = useAuth();
  const { data: payments } = usePayments();
  const { data: users } = useUsers();
  const { mutate: updatePayment, isPending } = useUpdatePayment();
  const createPayment = useCreatePayment();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const isCondomino = user?.userType === "condomino" || user?.userType === "gestor";
  const isArrendatario = user?.userType === "arrendatario";

  const myPayments = payments?.filter(p => p.userId === user?.id) || [];
  const myTenants = users?.filter(u => u.relatedCondominoId === user?.id) || [];
  const tenantPayments = (tenantId: number) => payments?.filter(p => p.userId === tenantId) || [];

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      userId: 0,
      description: "",
      amount: "0",
      status: "pending",
      dueDate: new Date(),
    },
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

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status === "pending" && new Date(dueDate) < new Date();
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

      <Tabs defaultValue="meus" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="meus">Os Meus Pagamentos</TabsTrigger>
          {isCondomino && myTenants.length > 0 && (
            <TabsTrigger value="arrendatarios">
              <Users className="w-4 h-4 mr-2" />
              Arrendatários ({myTenants.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* --- Meus Pagamentos --- */}
        <TabsContent value="meus">
          {myPayments.filter(p => p.status === "pending").length === 0 && myPayments.filter(p => p.status === "paid").length === 0 ? (
            <Card className="p-10 text-center border-dashed border-border/70">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-bold text-lg">Sem pagamentos registados</p>
              <p className="text-muted-foreground text-sm mt-1">Não tem avisos de pagamento pendentes.</p>
            </Card>
          ) : (
            <>
              {/* Pagamentos Pendentes */}
              {myPayments.filter(p => p.status === "pending").length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {myPayments.filter(p => p.status === "pending").map(p => {
                    const isOverdue = new Date(p.dueDate) < new Date();
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className={`p-6 relative overflow-hidden shadow-sm border-2 ${isOverdue ? "border-rose-200 bg-rose-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CreditCard className="w-16 h-16" />
                          </div>
                          <Badge variant="outline" className={`mb-4 inline-flex items-center gap-1 ${isOverdue ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                            {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {isOverdue ? "Em Atraso" : "A Pagamento"}
                          </Badge>
                          <h3 className="text-2xl font-bold mb-1">€{p.amount}</h3>
                          <p className="font-medium text-foreground/80 mb-1">{p.description}</p>
                          <p className="text-sm text-muted-foreground mb-6">
                            Vence: {format(new Date(p.dueDate), "dd 'de' MMM, yyyy", { locale: ptBR })}
                          </p>
                          <div className="space-y-2 mb-6 bg-white/70 p-3 rounded-lg border border-border/50 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Entidade:</span><span className="font-mono font-bold">12345</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Referência:</span><span className="font-mono font-bold">123 456 789</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Valor:</span><span className="font-mono font-bold">€{p.amount}</span></div>
                          </div>
                          <Button
                            className={`w-full ${isOverdue ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"}`}
                            onClick={() => handlePay(p.id)}
                            disabled={isPending}
                          >
                            {isPending ? "A processar..." : "Pagar com MBWay"}
                          </Button>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Histórico */}
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
                            <p className="text-sm text-muted-foreground">
                              Pago a {format(new Date(p.dueDate), "dd MMM yyyy", { locale: ptBR })}
                            </p>
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

        {/* --- Arrendatários --- */}
        {isCondomino && myTenants.length > 0 && (
          <TabsContent value="arrendatarios" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground text-sm">Crie e acompanhe avisos de pagamento para os seus arrendatários.</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Novo Aviso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Aviso de Pagamento</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Arrendatário</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o arrendatário" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {myTenants.map(t => (
                                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Input placeholder="Ex: Renda Mensal - Junho" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor (€)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Limite</FormLabel>
                            <FormControl>
                              <Input type="date" onChange={(e) => field.onChange(new Date(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
              return (
                <Card key={tenant.id} className="overflow-hidden border-border/50">
                  <div className="p-4 bg-secondary/30 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">Fração {tenant.unit}</p>
                      </div>
                    </div>
                    {pendingCount > 0 && (
                      <Badge className="bg-amber-50 text-amber-600 border-amber-200">{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</Badge>
                    )}
                  </div>
                  {tPayments.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">Sem avisos de pagamento.</div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {tPayments.map(p => (
                        <div key={p.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{p.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(p.dueDate), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">€{p.amount}</span>
                            {getStatusBadge(p.status, p.dueDate.toString())}
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
