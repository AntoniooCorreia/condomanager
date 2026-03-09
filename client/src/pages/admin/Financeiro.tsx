import { usePayments, useUsers, useUpdatePayment, useCreatePayment, useDeletePayment } from "@/hooks/use-condominium";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Card } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
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

export function Financeiro() {
  const { data: payments, isLoading } = usePayments();
  const { data: users } = useUsers();
  const { mutate: updatePayment, isPending } = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const createPayment = useCreatePayment();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

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

  const handleMarkPaid = (id: number) => {
    updatePayment({ id, status: 'paid' }, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Pagamento marcado como pago." });
      }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1"/> Pago</Badge>;
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
          <Button variant="outline" className="bg-white">Exportar</Button>
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
                        <FormLabel>Condómino</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o condómino" />
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
        <Card className="overflow-hidden border-border/50 shadow-sm">
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
              ) : payments?.map((payment) => {
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
                        {payment.status !== 'paid' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleMarkPaid(payment.id)}
                            disabled={isPending}
                          >
                            Marcar Pago
                          </Button>
                        )}
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
        </Card>
      </motion.div>
    </div>
  );
}
