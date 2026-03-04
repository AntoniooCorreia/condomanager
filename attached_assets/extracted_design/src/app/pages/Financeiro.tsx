import { Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/ui/badge";

const pagamentos = [
  {
    id: 1,
    fracao: "1A",
    nome: "João Silva",
    mes: "Fevereiro 2026",
    valor: 125.0,
    estado: "pago",
    data: "2026-02-05",
  },
  {
    id: 2,
    fracao: "1B",
    nome: "Maria Santos",
    mes: "Fevereiro 2026",
    valor: 125.0,
    estado: "pago",
    data: "2026-02-03",
  },
  {
    id: 3,
    fracao: "2A",
    nome: "Pedro Costa",
    mes: "Fevereiro 2026",
    valor: 150.0,
    estado: "pago",
    data: "2026-02-01",
  },
  {
    id: 4,
    fracao: "2B",
    nome: "Ana Rodrigues",
    mes: "Fevereiro 2026",
    valor: 125.0,
    estado: "atraso",
    data: null,
  },
  {
    id: 5,
    fracao: "3A",
    nome: "Carlos Oliveira",
    mes: "Fevereiro 2026",
    valor: 175.0,
    estado: "pago",
    data: "2026-02-08",
  },
  {
    id: 6,
    fracao: "3B",
    nome: "Sofia Ferreira",
    mes: "Fevereiro 2026",
    valor: 100.0,
    estado: "atraso",
    data: null,
  },
  {
    id: 7,
    fracao: "4A",
    nome: "Ricardo Martins",
    mes: "Fevereiro 2026",
    valor: 125.0,
    estado: "pago",
    data: "2026-02-04",
  },
  {
    id: 8,
    fracao: "4B",
    nome: "Teresa Alves",
    mes: "Fevereiro 2026",
    valor: 150.0,
    estado: "pendente",
    data: null,
  },
];

const totalReceitas = pagamentos
  .filter((p) => p.estado === "pago")
  .reduce((sum, p) => sum + p.valor, 0);
const totalEmAtraso = pagamentos
  .filter((p) => p.estado === "atraso")
  .reduce((sum, p) => sum + p.valor, 0);

export function Financeiro() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Gestão Financeira
          </h1>
          <p className="text-gray-600 mt-1">
            Controlo de quotas e pagamentos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Receitas do Mês"
          value={`€${totalReceitas.toFixed(2)}`}
          icon={TrendingUp}
          color="green"
          trend={{ value: "+8% vs mês anterior", isPositive: true }}
        />
        <StatCard
          title="Em Atraso"
          value={`€${totalEmAtraso.toFixed(2)}`}
          icon={TrendingDown}
          color="red"
          trend={{ value: "-15% vs mês anterior", isPositive: true }}
        />
        <StatCard
          title="Taxa de Cobrança"
          value="87.5%"
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Histórico de Pagamentos - Fevereiro 2026
          </h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condómino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagamentos.map((pagamento) => (
                <tr
                  key={pagamento.id}
                  className={`hover:bg-gray-50 ${
                    pagamento.estado === "atraso" ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {pagamento.fracao}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {pagamento.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pagamento.mes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      €{pagamento.valor.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pagamento.data
                        ? new Date(pagamento.data).toLocaleDateString("pt-PT")
                        : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pagamento.estado === "pago" && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Pago
                      </Badge>
                    )}
                    {pagamento.estado === "atraso" && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                        Em Atraso
                      </Badge>
                    )}
                    {pagamento.estado === "pendente" && (
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                        Pendente
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {pagamentos.map((pagamento) => (
            <div
              key={pagamento.id}
              className={`p-4 rounded-lg border ${
                pagamento.estado === "atraso"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {pagamento.fracao}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {pagamento.nome}
                    </h3>
                    <p className="text-sm text-gray-500">{pagamento.mes}</p>
                  </div>
                </div>
                {pagamento.estado === "pago" && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Pago
                  </Badge>
                )}
                {pagamento.estado === "atraso" && (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                    Atraso
                  </Badge>
                )}
                {pagamento.estado === "pendente" && (
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                    Pendente
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-semibold text-gray-900">
                    €{pagamento.valor.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="text-gray-900">
                    {pagamento.data
                      ? new Date(pagamento.data).toLocaleDateString("pt-PT")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
