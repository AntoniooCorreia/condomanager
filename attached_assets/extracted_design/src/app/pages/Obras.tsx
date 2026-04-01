import { Plus, Calendar, Euro, Users, CheckCircle, Clock, PlayCircle, FileCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

const obras = [
  {
    id: 1,
    titulo: "Pintura Exterior do Edifício",
    descricao: "Renovação completa da pintura exterior com tratamento anti-humidade",
    valor: 15000,
    dataInicio: "2026-03-01",
    dataFim: "2026-04-15",
    estado: "proposta",
    votacao: { sim: 28, nao: 5, abstencoes: 15 },
    progresso: 0,
  },
  {
    id: 2,
    titulo: "Reparação do Portão Principal",
    descricao: "Substituição do motor e sistema de abertura automática",
    valor: 3500,
    dataInicio: "2026-02-08",
    dataFim: "2026-02-15",
    estado: "execucao",
    votacao: { sim: 42, nao: 2, abstencoes: 4 },
    progresso: 65,
  },
  {
    id: 3,
    titulo: "Manutenção dos Elevadores",
    descricao: "Revisão técnica anual e substituição de cabos",
    valor: 5200,
    dataInicio: "2026-01-10",
    dataFim: "2026-01-20",
    estado: "concluida",
    votacao: { sim: 45, nao: 0, abstencoes: 3 },
    progresso: 100,
  },
  {
    id: 4,
    titulo: "Instalação de Painéis Solares",
    descricao: "Sistema fotovoltaico para áreas comuns",
    valor: 25000,
    dataInicio: "2026-05-01",
    dataFim: "2026-06-30",
    estado: "aprovada",
    votacao: { sim: 38, nao: 8, abstencoes: 2 },
    progresso: 0,
  },
];

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "proposta":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Proposta</Badge>;
    case "aprovada":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aprovada</Badge>;
    case "execucao":
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Em Execução</Badge>;
    case "concluida":
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Concluída</Badge>;
    default:
      return null;
  }
};

const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case "proposta":
      return Clock;
    case "aprovada":
      return CheckCircle;
    case "execucao":
      return PlayCircle;
    case "concluida":
      return FileCheck;
    default:
      return Clock;
  }
};

export function Obras() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Obras e Manutenção
          </h1>
          <p className="text-gray-600 mt-1">
            Gestão de obras e votações
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="h-4 w-4" />
          Nova Proposta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Propostas</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">1</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Aprovadas</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">1</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <PlayCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Em Execução</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">1</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FileCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Concluídas</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">1</p>
        </div>
      </div>

      {/* Obras List */}
      <div className="space-y-4">
        {obras.map((obra) => {
          const Icon = getEstadoIcon(obra.estado);
          const totalVotos = obra.votacao.sim + obra.votacao.nao + obra.votacao.abstencoes;
          const percentagemSim = ((obra.votacao.sim / totalVotos) * 100).toFixed(0);

          return (
            <div
              key={obra.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`
                      p-2 rounded-lg mt-1
                      ${obra.estado === "proposta" ? "bg-blue-50 text-blue-600" : ""}
                      ${obra.estado === "aprovada" ? "bg-green-50 text-green-600" : ""}
                      ${obra.estado === "execucao" ? "bg-orange-50 text-orange-600" : ""}
                      ${obra.estado === "concluida" ? "bg-gray-50 text-gray-600" : ""}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {obra.titulo}
                        </h3>
                        {getEstadoBadge(obra.estado)}
                      </div>
                      <p className="text-gray-600 mb-3">{obra.descricao}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Valor</p>
                          <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <Euro className="h-4 w-4" />
                            {obra.valor.toLocaleString("pt-PT")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Início</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(obra.dataInicio).toLocaleDateString("pt-PT")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Fim Previsto</p>
                          <p className="font-medium text-gray-900">
                            {new Date(obra.dataFim).toLocaleDateString("pt-PT")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Progresso</p>
                          <p className="font-semibold text-gray-900">{obra.progresso}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {obra.estado === "execucao" && (
                <div className="mb-4">
                  <Progress value={obra.progresso} className="h-2" />
                </div>
              )}

              {/* Voting Results */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Votação</h4>
                  <span className="text-sm text-gray-500">
                    ({totalVotos} votos • {percentagemSim}% aprovação)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-sm text-green-600 mb-1">A Favor</p>
                    <p className="text-xl font-semibold text-green-700">{obra.votacao.sim}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <p className="text-sm text-red-600 mb-1">Contra</p>
                    <p className="text-xl font-semibold text-red-700">{obra.votacao.nao}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Abstenções</p>
                    <p className="text-xl font-semibold text-gray-700">{obra.votacao.abstencoes}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
                {obra.estado === "proposta" && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Votar Agora
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
