import { usePayments, useUsers, useCreatePayment, useDeletePayment, useApprovePayment, useRejectPayment } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Card } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, Plus, Trash2, Download, FileSpreadsheet, FileText, XCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema, type InsertPayment, type Payment } from "@shared/schema";
import { useState } from "react";
import * as XLSX from "xlsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mbway: "MBWay",
  transferencia: "Transferencia Bancaria (NIB)",
  dinheiro: "Dinheiro",
  cheque: "Cheque",
  outro: "Outro",
};

export function Financeiro() {
  const { user } = useAuth();
  const { data: payments, isLoading } = usePayments();
  const { data: users } = useUsers();
  const deletePayment = useDeletePayment();
  const createPayment = useCreatePayment();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("aprovar");
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
  const awaitingPayments = payments?.filter(p => p.status === 'aguarda_aprovacao') || [];
  const rejectedPayments = payments?.filter(p => p.status === 'rejeitado') || [];
  const paidPayments = payments?.filter(p => p.status === 'paid') || [];

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

  const handleApprove = (id: number) => {
    approvePayment.mutate({ id, approvedBy: user?.id }, {
      onSuccess: () => toast({ title: "Sucesso", description: "Pagamento aprovado." }),
      onError: (err: any) => toast({ title: "Erro", description: err?.message || "Nao foi possivel aprovar.", variant: "destructive" }),
    });
  };

  const handleReject = () => {
    if (!rejectingPayment) return;
    rejectPayment.mutate({ id: rejectingPayment.id, reason: rejectReason }, {
      onSuccess: () => {
        toast({ title: "Comprovativo rejeitado" });
        setRejectingPayment(null);
        setRejectReason("");
      },
      onError: (err: any) => toast({ title: "Erro", description: err?.message || "Nao foi possivel rejeitar.", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem a certeza que deseja eliminar este aviso?")) {
      deletePayment.mutate(id, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Aviso eliminado." });
        }
      });
    }
  };

  const buildRows = () => {
    const list = [...awaitingPayments, ...pendingPayments, ...rejectedPayments, ...paidPayments].sort((a, b) => {
      const ua = users?.find(x => x.id === a.userId)?.unit || "";
      const ub = users?.find(x => x.id === b.userId)?.unit || "";
      if (ua !== ub) return ua.localeCompare(ub);
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    const statusLabel: Record<string, string> = { paid: "Pago", pending: "Pendente", aguarda_aprovacao: "Aguarda Aprovacao", rejeitado: "Rejeitado" };
    return list.map(p => {
      const u = users?.find(x => x.id === p.userId);
      return {
        "Fracao": u?.unit || "N/A",
        "Nome": u?.name || "N/A",
        "Descricao": p.description,
        "Valor (EUR)": Number(p.amount),
        "Data Limite": format(new Date(p.dueDate), "dd/MM/yyyy"),
        "Estado": statusLabel[p.status] || p.status,
      };
    });
  };

  const fileName = () => "financeiro-" + format(new Date(), "yyyy-MM-dd");

  const exportCSV = () => {
    const rows = buildRows();
    if (rows.length === 0) { toast({ title: "Nada para exportar", variant: "destructive" }); return; }
    const headers = Object.keys(rows[0]);
    const esc = (v: any) => '"' + String(v).replace(/"/g, '""') + '"';
    const csv = [headers.map(esc).join(";"), ...rows.map(r => headers.map(h => esc((r as any)[h])).join(";"))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName() + ".csv";
    link.click();
    URL.revokeObjectURL(link.href);
    toast({ title: "Exportado", description: rows.length + " registos em CSV." });
  };

  const exportExcel = () => {
    const rows = buildRows();
    if (rows.length === 0) { toast({ title: "Nada para exportar", variant: "destructive" }); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 10 }, { wch: 24 }, { wch: 30 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financeiro");
    XLSX.writeFile(wb, fileName() + ".xlsx");
    toast({ title: "Exportado", description: rows.length + " registos em Excel." });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1"/> Pago</Badge>;
      case 'aguarda_aprovacao': return <Badge className="bg-blue-50 text-blue-600 border-blue-200"><Clock className="w-3 h-3 mr-1"/> Aguarda Aprovação</Badge>;
      case 'rejeitado': return <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"><XCircle className="w-3 h-3 mr-1"/> Rejeitado</Badge>;
      case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200"><Clock className="w-3 h-3 mr-1"/> Pendente</Badge>;
      case 'overdue': return <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"><AlertCircle className="w-3 h-3 mr-1"/> Em Atraso</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestão Financeira</h1>
          <p className="text-muted-foreground mt-1">Acompanhamento de quotas e pagamentos.</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white">
                <Download className="w-4 h-4 mr-2" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportCSV}>
                <FileText className="w-4 h-4 mr-2" /> Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">Novo Aviso</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Aviso de Pagamento</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proprietário</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o Proprietário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.filter(u => u.role === 'user').map(u => (
                              <SelectItem key={u.id} value={u.id.toString()}>{u.unit} - {u.name}</SelectItem>
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
                        <FormControl><Input placeholder="Ex: Quota Mensal - Junho" {...field} /></FormControl>
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border/50 shadow-sm">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger value="aprovar" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Por Aprovar ({awaitingPayments.length})
              </TabsTrigger>
              <TabsTrigger value="pagar" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Por Pagar ({pendingPayments.length})
              </TabsTrigger>
              <TabsTrigger value="rejeitados" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Rejeitados ({rejectedPayments.length})
              </TabsTrigger>
              <TabsTrigger value="pagos" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Pagos ({paidPayments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="aprovar" className="mt-0">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border/50">
                    <TableHead>Fração</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Comprovativo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10">A carregar...</TableCell></TableRow>
                  ) : awaitingPayments.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Sem comprovativos por aprovar.</TableCell></TableRow>
                  ) : awaitingPayments.map((payment) => {
                    const u = users?.find(x => x.id === payment.userId);
                    return (
                      <TableRow key={payment.id} className="border-border/50 hover:bg-secondary/20 bg-blue-50/20">
                        <TableCell className="font-medium">{u?.unit || 'N/A'} <span className="text-muted-foreground font-normal">· {u?.name}</span></TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.paymentMethod ? PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod : "-"}</TableCell>
                        <TableCell>
                          {payment.proofUrl ? (
                            <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                              <ExternalLink className="w-3.5 h-3.5" /> Ver
                            </a>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="font-bold">€{payment.amount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApprove(payment.id)}
                              disabled={approvePayment.isPending}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => { setRejectingPayment(payment); setRejectReason(""); }}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeitar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pagar" className="mt-0">
              <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border/50">
                <TableHead>Fração</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data Limite</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10">A carregar...</TableCell></TableRow>
                  ) : pendingPayments.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Sem pagamentos pendentes.</TableCell></TableRow>
                  ) : pendingPayments.map((payment) => {
                    const user = users?.find(u => u.id === payment.userId);
                    return (
                      <TableRow key={payment.id} className="border-border/50 hover:bg-secondary/20">
                        <TableCell className="font-medium">{user?.unit || 'N/A'}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(payment.dueDate), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-bold">€{payment.amount}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => handleDelete(payment.id)}
                              disabled={deletePayment.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="rejeitados" className="mt-0">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border/50">
                    <TableHead>Fração</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10">A carregar...</TableCell></TableRow>
                  ) : rejectedPayments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Sem comprovativos rejeitados.</TableCell></TableRow>
                  ) : rejectedPayments.map((payment) => {
                    const u = users?.find(x => x.id === payment.userId);
                    return (
                      <TableRow key={payment.id} className="border-border/50 hover:bg-secondary/20">
                        <TableCell className="font-medium">{u?.unit || 'N/A'} <span className="text-muted-foreground font-normal">· {u?.name}</span></TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.rejectionReason || "-"}</TableCell>
                        <TableCell className="font-bold">€{payment.amount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDelete(payment.id)}
                            disabled={deletePayment.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pagos" className="mt-0">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border/50">
                    <TableHead>Fração</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10">A carregar...</TableCell></TableRow>
                  ) : paidPayments.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Sem pagamentos pagos.</TableCell></TableRow>
                  ) : paidPayments.map((payment) => {
                    const user = users?.find(u => u.id === payment.userId);
                    return (
                      <TableRow key={payment.id} className="border-border/50 hover:bg-secondary/20">
                        <TableCell className="font-medium">{user?.unit || 'N/A'}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(payment.dueDate), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-bold">€{payment.amount}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDelete(payment.id)}
                            disabled={deletePayment.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>

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