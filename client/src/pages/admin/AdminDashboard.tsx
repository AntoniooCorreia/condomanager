import { motion } from "framer-motion";
import { Users, Euro, HardHat, AlertTriangle, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { usePayments, useUsers, useWorks, useSecurityLogs, useReservations } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminDashboard() {
  const { data: users } = useUsers();
  const { data: payments } = usePayments();
  const { data: works } = useWorks();
  const { data: logs } = useSecurityLogs();
  const { data: reservations } = useReservations();

  const totalUsers = users?.filter(u => u.role !== "admin").length || 0;
  const totalPaid = payments?.filter(p => p.status === "paid").reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
  const totalPending = payments?.filter(p => p.status === "pending").reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
  const activeWorks = works?.filter(w => w.status === "in_progress").length || 0;
  const openAlerts = logs?.filter(l => l.status === "open").length || 0;
  const pendingReservations = reservations?.filter(r => r.status === "pending").length || 0;

  // Grafico dos ultimos 6 meses com dados reais
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthPayments = payments?.filter(p => p.status === "paid" && isSameMonth(new Date(p.dueDate), date)) || [];
    const total = monthPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
    return {
      name: format(date, "MMM", { locale: ptBR }),
      value: total
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visao geral do estado do condominio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Utilizadores"
          value={totalUsers}
          icon={<Users className="w-6 h-6" />}
          delay={0}
        />
        <StatCard
          title="Receita Total"
          value={`EUR ${totalPaid.toFixed(2)}`}
          icon={<Euro className="w-6 h-6" />}
          trend={`${payments?.filter(p => p.status === "paid").length || 0} pagamentos`}
          trendUp={true}
          delay={0.1}
        />
        <StatCard
          title="Pendente"
          value={`EUR ${totalPending.toFixed(2)}`}
          icon={<Clock className="w-6 h-6" />}
          trend={`${payments?.filter(p => p.status === "pending").length || 0} em falta`}
          trendUp={false}
          delay={0.2}
        />
        <StatCard
          title="Alertas Abertos"
          value={openAlerts}
          icon={<AlertTriangle className="w-6 h-6" />}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 h-[400px] flex flex-col shadow-sm">
            <h3 className="text-lg font-bold mb-6 font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Receitas dos Ultimos 6 Meses
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last6Months}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `EUR${val}`} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--secondary))" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(val: any) => [`EUR ${Number(val).toFixed(2)}`, "Receita"]}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4"
        >
          <Card className="p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 font-display flex items-center gap-2">
              <HardHat className="w-5 h-5 text-primary" /> Obras a Decorrer
            </h3>
            <div className="space-y-3">
              {works?.filter(w => w.status === "in_progress").slice(0, 3).map(work => (
                <div key={work.id} className="p-3 rounded-xl border border-border/50 bg-secondary/30">
                  <p className="font-semibold text-sm">{work.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{work.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">Em Curso</Badge>
                    {work.cost && <span className="text-xs text-muted-foreground">EUR {work.cost}</span>}
                  </div>
                </div>
              ))}
              {activeWorks === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma obra a decorrer.</p>}
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 font-display">Resumo</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Reservas pendentes</span>
                <Badge variant="outline">{pendingReservations}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Obras ativas</span>
                <Badge variant="outline">{activeWorks}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Alertas abertos</span>
                <Badge variant="outline" className={openAlerts > 0 ? "border-rose-200 text-rose-600" : ""}>{openAlerts}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total utilizadores</span>
                <Badge variant="outline">{totalUsers}</Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}