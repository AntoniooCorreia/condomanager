import { StatCard } from "../components/StatCard";
import { CreditCard, Calendar, AlertCircle, CheckCircle2, HardHat, Bell } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const alertas = [
  {
    id: 1,
    tipo: "pagamento",
    titulo: "Quota de Fevereiro disponível",
    mensagem: "A sua quota mensal já está disponível para pagamento",
    prioridade: "normal",
  },
  {
    id: 2,
    tipo: "obra",
    titulo: "Nova votação: Pintura Exterior",
    mensagem: "Por favor vote na proposta de pintura do edifício",
    prioridade: "alta",
  },
  {
    id: 3,
    tipo: "reserva",
    titulo: "Reserva confirmada",
    mensagem: "Campo de ténis - 15 Fev, 14:00",
    prioridade: "normal",
  },
];

const proximasReservas = [
  {
    id: 1,
    espaco: "Campo de Ténis",
    data: "2026-02-15",
    horario: "14:00 - 16:00",
  },
  {
    id: 2,
    espaco: "Sauna",
    data: "2026-02-20",
    horario: "19:00 - 20:00",
  },
];

export function UserHome() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Bem-vindo, João Silva
        </h1>
        <p className="text-gray-600 mt-1">Fração 1A • Edifício Central</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Quota do Mês"
          value="€125,00"
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Estado Pagamento"
          value="Em Dia"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Próximas Reservas"
          value="2"
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Obras Ativas"
          value="2"
          icon={HardHat}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Alertas</h2>
          </div>
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-lg border ${
                  alerta.prioridade === "alta"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-gray-900">{alerta.titulo}</h3>
                  {alerta.prioridade === "alta" && (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                      Urgente
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{alerta.mensagem}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Reservas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Minhas Reservas
            </h2>
          </div>
          <div className="space-y-3">
            {proximasReservas.map((reserva) => (
              <div
                key={reserva.id}
                className="p-3 rounded-lg bg-blue-50 border border-blue-200"
              >
                <h3 className="font-medium text-blue-900">{reserva.espaco}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {new Date(reserva.data).toLocaleDateString("pt-PT")}
                </p>
                <p className="text-sm text-blue-600">{reserva.horario}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Ver Todas
            </Button>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resumo Financeiro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Quota Mensal</p>
            <p className="text-2xl font-semibold text-gray-900">€125,00</p>
            <p className="text-sm text-green-600 mt-1">✓ Pago</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Permilagem</p>
            <p className="text-2xl font-semibold text-gray-900">2.5‰</p>
            <p className="text-sm text-gray-500 mt-1">Do valor total</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Histórico</p>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
              Ver Pagamentos
            </Button>
          </div>
        </div>
      </div>

      {/* Obras em Votação */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Obras em Votação
        </h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900">
                  Pintura Exterior do Edifício
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Renovação completa da pintura exterior
                </p>
              </div>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                Pendente
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">Valor: €15.000</p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Votar Sim
                </Button>
                <Button size="sm" variant="outline">
                  Votar Não
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
