import { useState } from "react";
import { Search, Filter, MoreVertical, Mail, Phone, CheckCircle, XCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const condominos = [
  {
    id: 1,
    fracao: "1A",
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "+351 912 345 678",
    permilagem: 2.5,
    valorQuota: 125.0,
    estadoPagamento: "pago",
  },
  {
    id: 2,
    fracao: "1B",
    nome: "Maria Santos",
    email: "maria.santos@email.com",
    telefone: "+351 913 456 789",
    permilagem: 2.5,
    valorQuota: 125.0,
    estadoPagamento: "pago",
  },
  {
    id: 3,
    fracao: "2A",
    nome: "Pedro Costa",
    email: "pedro.costa@email.com",
    telefone: "+351 914 567 890",
    permilagem: 3.0,
    valorQuota: 150.0,
    estadoPagamento: "pago",
  },
  {
    id: 4,
    fracao: "2B",
    nome: "Ana Rodrigues",
    email: "ana.rodrigues@email.com",
    telefone: "+351 915 678 901",
    permilagem: 2.5,
    valorQuota: 125.0,
    estadoPagamento: "atraso",
  },
  {
    id: 5,
    fracao: "3A",
    nome: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    telefone: "+351 916 789 012",
    permilagem: 3.5,
    valorQuota: 175.0,
    estadoPagamento: "pago",
  },
  {
    id: 6,
    fracao: "3B",
    nome: "Sofia Ferreira",
    email: "sofia.ferreira@email.com",
    telefone: "+351 917 890 123",
    permilagem: 2.0,
    valorQuota: 100.0,
    estadoPagamento: "atraso",
  },
  {
    id: 7,
    fracao: "4A",
    nome: "Ricardo Martins",
    email: "ricardo.martins@email.com",
    telefone: "+351 918 901 234",
    permilagem: 2.5,
    valorQuota: 125.0,
    estadoPagamento: "pago",
  },
  {
    id: 8,
    fracao: "4B",
    nome: "Teresa Alves",
    email: "teresa.alves@email.com",
    telefone: "+351 919 012 345",
    permilagem: 3.0,
    valorQuota: 150.0,
    estadoPagamento: "pago",
  },
];

export function Condominos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "pago" | "atraso">("todos");

  const filteredCondominos = condominos.filter((c) => {
    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fracao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "todos" || c.estadoPagamento === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Gestão de Condóminos
          </h1>
          <p className="text-gray-600 mt-1">
            {condominos.length} frações registadas
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          + Adicionar Condómino
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar por nome ou fração..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "todos" ? "default" : "outline"}
            onClick={() => setFilterStatus("todos")}
            className={filterStatus === "todos" ? "bg-blue-600" : ""}
          >
            Todos
          </Button>
          <Button
            variant={filterStatus === "pago" ? "default" : "outline"}
            onClick={() => setFilterStatus("pago")}
            className={filterStatus === "pago" ? "bg-green-600" : ""}
          >
            Pagos
          </Button>
          <Button
            variant={filterStatus === "atraso" ? "default" : "outline"}
            onClick={() => setFilterStatus("atraso")}
            className={filterStatus === "atraso" ? "bg-red-600" : ""}
          >
            Em Atraso
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proprietário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permilagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quota Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCondominos.map((condomino) => (
                <tr key={condomino.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {condomino.fracao}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {condomino.nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      {condomino.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {condomino.telefone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {condomino.permilagem}‰
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      €{condomino.valorQuota.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {condomino.estadoPagamento === "pago" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Pago
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                        <XCircle className="w-3 h-3 mr-1" />
                        Em Atraso
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredCondominos.map((condomino) => (
          <div
            key={condomino.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {condomino.fracao}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {condomino.nome}
                  </h3>
                  <p className="text-sm text-gray-500">{condomino.email}</p>
                </div>
              </div>
              {condomino.estadoPagamento === "pago" ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Pago
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  Atraso
                </Badge>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone:</span>
                <span className="text-gray-900">{condomino.telefone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Permilagem:</span>
                <span className="text-gray-900">{condomino.permilagem}‰</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quota Mensal:</span>
                <span className="font-semibold text-gray-900">
                  €{condomino.valorQuota.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
