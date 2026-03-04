import { usePayments } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export function UserPagamentos() {
  const { user } = useAuth();
  const { data: payments } = usePayments();
  const myPayments = payments?.filter(p => p.userId === user?.id) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Meus Pagamentos</h1>
        <p className="text-muted-foreground mt-1">Histórico de quotas e referências multibanco.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {myPayments.filter(p => p.status === 'pending').map(p => (
          <Card key={p.id} className="p-6 border-amber-200 bg-amber-50/30 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 text-amber-500/20"><CreditCard className="w-16 h-16" /></div>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 mb-4 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> A Pagamento
            </Badge>
            <h3 className="text-2xl font-bold mb-1">€{p.amount}</h3>
            <p className="font-medium text-foreground/80 mb-6">{p.description}</p>
            
            <div className="space-y-2 mb-6 bg-white p-3 rounded-lg border border-border shadow-sm text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Entidade:</span><span className="font-mono font-bold">12345</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Referência:</span><span className="font-mono font-bold">123 456 789</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Valor:</span><span className="font-mono font-bold">€{p.amount}</span></div>
            </div>
            
            <Button className="w-full bg-amber-600 hover:bg-amber-700">Pagar com MBWay</Button>
          </Card>
        ))}
      </div>

      <h3 className="text-xl font-bold font-display mt-10 mb-4">Histórico</h3>
      <div className="space-y-3">
        {myPayments.filter(p => p.status === 'paid').map(p => (
          <Card key={p.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold">{p.description}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
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
    </div>
  );
}
