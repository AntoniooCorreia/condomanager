import { motion } from "framer-motion";
import { Users, Euro, HardHat, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { usePayments, useUsers, useWorks, useSecurityLogs } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function AdminDashboard() {
  const { data: users } = useUsers();
  const { data: payments } = usePayments();
  const { data: works } = useWorks();
  const { data: logs } = useSecurityLogs();

  const totalReceived = payments?.filter(p => p.status === 'paid').reduce((acc, curr) => acc + parseFloat(curr.amount), 0) || 0;
  const totalOverdue = payments?.filter(p => p.status === 'overdue').reduce((acc, curr) => acc + parseFloat(curr.amount), 0) || 0;
  const activeWorks = works?.filter(w => w.status === 'in_progress').length || 0;
  const openAlerts = logs?.filter(l => l.status === 'open').length || 0;

  const revenueData = [
    { name: 'Jan', value: 1200 },
    { name: 'Fev', value: 1150 },
    { name: 'Mar', value: 1300 },
    { name: 'Abr', value: 1400 },
    { name: 'Mai', value: totalReceived },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do estado do condomínio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Proprietários" 
          value={users?.filter(u => u.role === 'user').length || 0} 
          icon={<Users className="w-6 h-6" />} 
          delay={0}
        />
        <StatCard 
          title="Receita Mensal" 
          value={`€${totalReceived.toFixed(2)}`} 
          icon={<Euro className="w-6 h-6" />} 
          trend="8% vs mês ant."
          trendUp={true}
          delay={0.1}
        />
        <StatCard 
          title="Quotas em Atraso" 
          value={`€${totalOverdue.toFixed(2)}`} 
          icon={<Euro className="w-6 h-6" />} 
          trend="Precisa atenção"
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
            <h3 className="text-lg font-bold mb-6 font-display">Receitas de Quotas (2024)</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `€${val}`} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--secondary))'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
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
        >
          <Card className="p-6 h-[400px] shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-4 font-display flex items-center gap-2">
              <HardHat className="w-5 h-5 text-primary" /> Obras a Decorrer
            </h3>
            <div className="flex-1 overflow-auto space-y-4 pr-2">
              {works?.filter(w => w.status === 'in_progress').map(work => (
                <div key={work.id} className="p-4 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <h4 className="font-semibold text-foreground">{work.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{work.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-medium">
                    <span className="text-primary bg-primary/10 px-2 py-1 rounded-md">Em Curso</span>
                    <span className="text-muted-foreground">€{work.cost}</span>
                  </div>
                </div>
              ))}
              {activeWorks === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Nenhuma obra a decorrer.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
