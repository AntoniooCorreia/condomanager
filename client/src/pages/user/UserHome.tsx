import { useAuth } from "@/hooks/use-auth";
import { usePayments, useReservations, useUsers } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, Bell, ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Building2 } from "lucide-react";

export function UserHome() {
  const { user } = useAuth();
  const { data: payments } = usePayments();
  const { data: reservations } = useReservations();
  const { data: users } = useUsers();

  const myPayments = payments?.filter(p => p.userId === user?.id) || [];
  const pendingPayment = myPayments.find(p => p.status !== 'paid');
  
  const myNextRes = reservations
    ?.filter(r => r.userId === user?.id && new Date(r.date) >= new Date() && r.status === 'approved')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const myTenants = user?.id ? users?.filter(u => u.relatedCondominoId === user.id) || [] : [];

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
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Olá, {user?.name.split(' ')[0]}</h1>
          <p className="text-primary-foreground/80 max-w-lg">Bem-vindo à área do condómino. Aqui pode gerir pagamentos, efetuar reservas e aceder a informações do edifício.</p>
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
                  <p className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded">Vence a {format(new Date(pendingPayment.dueDate), "dd MMM", { locale: ptBR })}</p>
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

      {myTenants.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 border-border/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Meus Arrendatários</h3>
                <p className="text-sm text-muted-foreground">Utilizadores associados à sua fração</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myTenants.map(tenant => (
                <div key={tenant.id} className="bg-secondary/30 rounded-lg p-4 border border-border">
                  <p className="font-bold text-sm">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tenant.username}</p>
                  <Badge className="mt-2 bg-blue-50 text-blue-600 border-blue-200">Arrendatário</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
