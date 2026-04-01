import { StatCard } from "../components/StatCard";
import {
  Home,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { month: "Jan", receitas: 24000, despesas: 18000 },
  { month: "Fev", receitas: 24000, despesas: 19500 },
  { month: "Mar", receitas: 24000, despesas: 17800 },
  { month: "Abr", receitas: 24000, despesas: 20200 },
  { month: "Mai", receitas: 24000, despesas: 19000 },
  { month: "Jun", receitas: 24000, despesas: 21500 },
];

const pendingActions = [
  {
    id: 1,
    title: "Aprovação de obra - Pintura do edifício",
    type: "obra",
    priority: "high",
  },
  { id: 2, title: "Pagamento em atraso - Fração 3B", type: "pagamento", priority: "high" },
  { id: 3, title: "Reserva pendente - Campo de ténis", type: "reserva", priority: "medium" },
  { id: 4, title: "Manutenção elevador - Agendar", type: "manutencao", priority: "medium" },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visão geral do condomínio • Última atualização: 10 Fev 2026
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Frações"
          value="48"
          icon={Home}
          color="blue"
          trend={{ value: "+2 este ano", isPositive: true }}
        />
        <StatCard
          title="Pagamentos em Atraso"
          value="5"
          icon={AlertCircle}
          color="red"
          trend={{ value: "-3 vs mês anterior", isPositive: true }}
        />
        <StatCard
          title="Saldo Mensal"
          value="€4.200"
          icon={TrendingUp}
          color="green"
          trend={{ value: "+12% vs mês anterior", isPositive: true }}
        />
        <StatCard
          title="Próximas Reservas"
          value="12"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Chart & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Receitas vs Despesas
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Últimos 6 meses
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Despesas</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="receitas"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReceitas)"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDespesas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Pendentes
          </h2>
          <div className="space-y-3">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-gray-900 font-medium">
                    {action.title}
                  </p>
                  {action.priority === "high" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                      Urgente
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 capitalize">
                  {action.type}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Atividade Recente
        </h2>
        <div className="space-y-4">
          {[
            {
              icon: CheckCircle2,
              color: "text-green-600",
              bg: "bg-green-50",
              title: "Pagamento recebido - Fração 2A",
              time: "Há 2 horas",
            },
            {
              icon: Calendar,
              color: "text-blue-600",
              bg: "bg-blue-50",
              title: "Nova reserva - Sauna",
              time: "Há 4 horas",
            },
            {
              icon: Clock,
              color: "text-orange-600",
              bg: "bg-orange-50",
              title: "Obra em andamento - Reparação do portão",
              time: "Há 1 dia",
            },
            {
              icon: ArrowUpRight,
              color: "text-purple-600",
              bg: "bg-purple-50",
              title: "Novo condómino registado",
              time: "Há 2 dias",
            },
          ].map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-4">
                <div className={`${activity.bg} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
