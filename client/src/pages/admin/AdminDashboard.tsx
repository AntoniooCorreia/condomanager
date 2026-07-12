import { motion, AnimatePresence } from "framer-motion";
import { Users, Euro, HardHat, AlertTriangle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { usePayments, useUsers, useWorks, useSecurityLogs, useReservations } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subMonths, isSameMonth, isBefore, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

type Panel = "users" | "revenue" | "pending" | "alerts" | null;

const eur = (n: number) => "EUR " + n.toFixed(2);

const WORK_META: Record<string, { label: string; cls: string }> = {
  in_progress: { label: "Em Curso", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  planned: { label: "Planeada", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  planning: { label: "Planeada", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Concluida", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};
const wLabel = (s: string) => WORK_META[s]?.label || s;
const wCls = (s: string) => WORK_META[s]?.cls || "bg-secondary text-muted-foreground border-border";

export function AdminDashboard() {
  const { data: users } = useUsers();
  const { data: payments } = usePayments();
  const { data: works } = useWorks();
  const { data: logs } = useSecurityLogs();
  const { data: reservations } = useReservations();

  const [panel, setPanel] = useState<Panel>(null);
  const toggle = (p: Panel) => setPanel(panel === p ? null : p);

  const residents = users?.filter(u => u.username !== "admin" && u.username !== "sistema") || [];
  const totalUsers = residents.length;

  const paidList = payments?.filter(p => p.status === "paid") || [];
  const pendList = payments?.filter(p => p.status === "pending") || [];
  const totalPaid = paidList.reduce((a, p) => a + parseFloat(p.amount), 0);
  const totalPending = pendList.reduce((a, p) => a + parseFloat(p.amount), 0);

  const allWorks = works || [];
  const activeWorks = allWorks.filter(w => w.status !== "completed" && w.status !== "cancelled");
  const totalWorkCost = allWorks.reduce((a, w) => a + (w.cost ? parseFloat(String(w.cost)) : 0), 0);

  const openLogs = logs?.filter(l => l.status === "open") || [];
  const openAlerts = openLogs.length;
  const pendingReservations = reservations?.filter(r => r.status === "pending").length || 0;
  const overdueList = pendList.filter(p => isBefore(new Date(p.dueDate), new Date()));

  const nameOf = (id: any) => users?.find(u => u.id === Number(id));

  const revenueByUser = residents.map(u => {
    const list = paidList.filter(p => p.userId === u.id);
    return { u, list, total: list.reduce((a, p) => a + parseFloat(p.amount), 0) };
  }).filter(r => r.list.length > 0).sort((a, b) => b.total - a.total);

  const pendingByUser = residents.map(u => {
    const list = pendList.filter(p => p.userId === u.id);
    return { u, list, total: list.reduce((a, p) => a + parseFloat(p.amount), 0) };
  }).filter(r => r.list.length > 0).sort((a, b) => b.total - a.total);

  const userStats = residents.map(u => {
    const paid = paidList.filter(p => p.userId === u.id).reduce((a, p) => a + parseFloat(p.amount), 0);
    const pend = pendList.filter(p => p.userId === u.id);
    const pendTotal = pend.reduce((a, p) => a + parseFloat(p.amount), 0);
    const od = pend.filter(p => isBefore(new Date(p.dueDate), new Date())).length;
    return { u, paid, pendTotal, pendCount: pend.length, od };
  }).sort((a, b) => b.pendTotal - a.pendTotal);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const total = paidList.filter(p => isSameMonth(new Date(p.dueDate), date)).reduce((a, p) => a + parseFloat(p.amount), 0);
    return { name: format(date, "MMM", { locale: ptBR }), value: total };
  });

  const cardCls = (p: Panel) => "cursor-pointer rounded-2xl transition-all " + (panel === p ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-90");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visao geral do condominio. Clique num cartao para ver o detalhe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={cardCls("users")} onClick={() => toggle("users")}>
          <StatCard title="Total Utilizadores" value={totalUsers} icon={<Users className="w-6 h-6" />} delay={0} />
        </div>
        <div className={cardCls("revenue")} onClick={() => toggle("revenue")}>
          <StatCard title="Receita Total" value={eur(totalPaid)} icon={<Euro className="w-6 h-6" />} trend={paidList.length + " pagamentos"} trendUp={true} delay={0.1} />
        </div>
        <div className={cardCls("pending")} onClick={() => toggle("pending")}>
          <StatCard title="Pendente" value={eur(totalPending)} icon={<Clock className="w-6 h-6" />} trend={pendList.length + " em falta"} trendUp={false} delay={0.2} />
        </div>
        <div className={cardCls("alerts")} onClick={() => toggle("alerts")}>
          <StatCard title="Alertas Abertos" value={openAlerts} icon={<AlertTriangle className="w-6 h-6" />} delay={0.3} />
        </div>
      </div>

      <AnimatePresence>
        {panel && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="p-6 border-primary/30 shadow-sm">

              {panel === "users" && (
                <div>
                  <h3 className="font-display font-bold text-lg mb-4">Utilizadores ({totalUsers})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase text-muted-foreground border-b">
                        <tr><th className="text-left py-2">Fracao</th><th className="text-left py-2">Nome</th><th className="text-left py-2">Tipo</th><th className="text-right py-2">Pago</th><th className="text-right py-2">Em divida</th></tr>
                      </thead>
                      <tbody>
                        {userStats.map(s => (
                          <tr key={s.u.id} className="border-b border-border/40 hover:bg-secondary/30">
                            <td className="py-2 font-bold text-primary">{s.u.unit || "-"}</td>
                            <td className="py-2 font-medium">{s.u.name}</td>
                            <td className="py-2 text-muted-foreground capitalize">{s.u.userType}</td>
                            <td className="py-2 text-right text-emerald-600 font-semibold">{eur(s.paid)}</td>
                            <td className="py-2 text-right">
                              {s.pendTotal > 0
                                ? <span className={s.od > 0 ? "text-rose-600 font-semibold" : "text-amber-600 font-semibold"}>{eur(s.pendTotal)}{s.od > 0 ? " (" + s.od + " em atraso)" : ""}</span>
                                : <span className="text-muted-foreground">-</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold"><td colSpan={3} className="pt-3">Total</td><td className="pt-3 text-right text-emerald-600">{eur(totalPaid)}</td><td className="pt-3 text-right text-amber-600">{eur(totalPending)}</td></tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {panel === "revenue" && (
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Receita Total: {eur(totalPaid)}</h3>
                  <p className="text-sm text-muted-foreground mb-4">De onde vem o dinheiro, por pessoa.</p>
                  {revenueByUser.length === 0 ? <p className="text-sm text-muted-foreground">Sem pagamentos registados.</p> : (
                    <div className="space-y-4">
                      {revenueByUser.map(r => (
                        <div key={r.u.id} className="border rounded-xl p-4 border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">Fracao {r.u.unit} - {r.u.name}</p>
                            <p className="font-bold text-emerald-600">{eur(r.total)}</p>
                          </div>
                          <div className="space-y-1">
                            {r.list.map(p => (
                              <div key={p.id} className="flex justify-between text-xs text-muted-foreground">
                                <span>{p.description} - {format(new Date(p.dueDate), "dd MMM yyyy", { locale: ptBR })}</span>
                                <span className="font-medium">{eur(parseFloat(p.amount))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {panel === "pending" && (
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Pendente: {eur(totalPending)}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{pendList.length} pagamentos em falta, {overdueList.length} em atraso.</p>
                  {pendingByUser.length === 0 ? <p className="text-sm text-muted-foreground">Nada pendente.</p> : (
                    <div className="space-y-4">
                      {pendingByUser.map(r => (
                        <div key={r.u.id} className="border rounded-xl p-4 border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">Fracao {r.u.unit} - {r.u.name}</p>
                            <p className="font-bold text-amber-600">{eur(r.total)}</p>
                          </div>
                          <div className="space-y-1">
                            {r.list.map(p => {
                              const late = isBefore(new Date(p.dueDate), new Date());
                              const days = differenceInDays(new Date(), new Date(p.dueDate));
                              return (
                                <div key={p.id} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">{p.description} - vence {format(new Date(p.dueDate), "dd MMM yyyy", { locale: ptBR })}</span>
                                  <span className={late ? "text-rose-600 font-semibold" : "text-muted-foreground font-medium"}>
                                    {eur(parseFloat(p.amount))}{late ? " - " + days + "d atraso" : ""}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {panel === "alerts" && (
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Alertas Abertos ({openAlerts})</h3>
                  <p className="text-sm text-muted-foreground mb-4">{logs?.length || 0} ocorrencias no total.</p>
                  {openLogs.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum alerta em aberto.</p> : (
                    <div className="space-y-2">
                      {openLogs.map(l => {
                        const rep = nameOf(l.reportedBy);
                        const days = differenceInDays(new Date(), new Date(l.date));
                        return (
                          <div key={l.id} className="flex items-start justify-between gap-4 border rounded-xl p-3 border-rose-200 bg-rose-50/30">
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{l.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {rep ? "Fracao " + rep.unit + " (" + rep.name + ")" : "Sistema"} - {format(new Date(l.date), "dd MMM yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <Badge variant="outline" className="shrink-0 text-rose-600 border-rose-200 bg-white">{days}d aberto</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="p-6 h-[400px] flex flex-col shadow-sm">
            <h3 className="text-lg font-bold mb-6 font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Receitas dos Ultimos 6 Meses
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last6Months}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => "EUR" + val} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip cursor={{ fill: "hsl(var(--secondary))" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(val: any) => [eur(Number(val)), "Receita"]} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="space-y-4">
          <Card className="p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <HardHat className="w-5 h-5 text-primary" /> Obras ({allWorks.length})
              </h3>
              {totalWorkCost > 0 && <span className="text-xs text-muted-foreground">{eur(totalWorkCost)}</span>}
            </div>
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {allWorks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma obra registada.</p>
              ) : allWorks.map(work => (
                <div key={work.id} className="p-3 rounded-xl border border-border/50 bg-secondary/30">
                  <p className="font-semibold text-sm">{work.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{work.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge className={"text-xs " + wCls(work.status)}>{wLabel(work.status)}</Badge>
                    {work.cost && <span className="text-xs text-muted-foreground">{eur(parseFloat(String(work.cost)))}</span>}
                  </div>
                </div>
              ))}
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
                <Badge variant="outline">{activeWorks.length}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Obras concluidas</span>
                <Badge variant="outline">{allWorks.filter(w => w.status === "completed").length}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Custo total das obras</span>
                <Badge variant="outline">{eur(totalWorkCost)}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Alertas abertos</span>
                <Badge variant="outline" className={openAlerts > 0 ? "border-rose-200 text-rose-600" : ""}>{openAlerts}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Pagamentos em atraso</span>
                <Badge variant="outline" className={overdueList.length > 0 ? "border-rose-200 text-rose-600" : ""}>{overdueList.length}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Taxa de cobranca</span>
                <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                  {totalPaid + totalPending > 0 ? Math.round((totalPaid / (totalPaid + totalPending)) * 100) + "%" : "-"}
                </Badge>
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