import { usePayments, useUsers, useUpdatePayment } from "@/hooks/use-condominium";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Card } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function Financeiro() {
  const { data: payments, isLoading } = usePayments();
  const { data: users } = useUsers();
  const { mutate: updatePayment, isPending } = useUpdatePayment();
  const { toast } = useToast();

  const handleMarkPaid = (id: number) => {
    updatePayment({ id, status: 'paid' }, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Pagamento marcado como pago." });
      }
    });
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
          <Button className="shadow-lg shadow-primary/20">Novo Aviso</Button>
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
