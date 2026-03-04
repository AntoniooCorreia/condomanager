import { CreditCard, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const historicoPagamentos = [
  {
    id: 1,
    mes: "Janeiro 2026",
    valor: 125.0,
    estado: "pago",
    dataPagamento: "2026-01-05",
    metodoPagamento: "Transferência Bancária",
  },
  {
    id: 2,
    mes: "Dezembro 2025",
    valor: 125.0,
    estado: "pago",
    dataPagamento: "2025-12-03",
    metodoPagamento: "Multibanco",
  },
  {
    id: 3,
    mes: "Novembro 2025",
    valor: 125.0,
    estado: "pago",
    dataPagamento: "2025-11-08",
    metodoPagamento: "MB WAY",
  },
  {
    id: 4,
    mes: "Outubro 2025",
    valor: 125.0,
    estado: "pago",
    dataPagamento: "2025-10-04",
    metodoPagamento: "Transferência Bancária",
  },
  {
    id: 5,
    mes: "Setembro 2025",
    valor: 125.0,
    estado: "pago",
    dataPagamento: "2025-09-06",
    metodoPagamento: "Multibanco",
  },
];

export function UserPagamentos() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Pagamentos</h1>
        <p className="text-gray-600 mt-1">
          Gestão das suas quotas mensais
        </p>
      </div>

      {/* Current Payment Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-blue-100 mb-2">Quota do Mês</p>
            <h2 className="text-4xl font-bold mb-1">€125,00</h2>
            <p className="text-blue-100">Fevereiro 2026</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
              <CreditCard className="h-4 w-4" />
              Pagar Agora
            </Button>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Último pagamento: 05 Jan 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Estado</span>
          </div>
          <p className="text-xl font-semibold text-gray-900">Em Dia</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm font-medium">Permilagem</span>
          </div>
          <p className="text-xl font-semibold text-gray-900">2.5‰</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Próximo Vencimento</span>
          </div>
          <p className="text-xl font-semibold text-gray-900">01 Mar 2026</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Métodos de Pagamento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
            <h3 className="font-medium text-gray-900 mb-2">
              Transferência Bancária
            </h3>
            <p className="text-sm text-gray-600">IBAN: PT50 0000 0000 0000 0000 000</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-900 mb-2">Multibanco</h3>
            <p className="text-sm text-gray-600">Entidade: 12345</p>
            <p className="text-sm text-gray-600">Referência: 123 456 789</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 cursor-pointer transition-colors">
            <h3 className="font-medium text-gray-900 mb-2">MB WAY</h3>
            <p className="text-sm text-gray-600">+351 912 345 678</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Histórico de Pagamentos
          </h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
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
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historicoPagamentos.map((pagamento) => (
                <tr key={pagamento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {pagamento.mes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      €{pagamento.valor.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(pagamento.dataPagamento).toLocaleDateString(
                        "pt-PT"
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {pagamento.metodoPagamento}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Pago
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {historicoPagamentos.map((pagamento) => (
            <div
              key={pagamento.id}
              className="p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {pagamento.mes}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(pagamento.dataPagamento).toLocaleDateString(
                      "pt-PT"
                    )}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Pago
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-semibold text-gray-900">
                    €{pagamento.valor.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="text-gray-900">
                    {pagamento.metodoPagamento}
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
