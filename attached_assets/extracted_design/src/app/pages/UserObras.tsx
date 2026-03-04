import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  Euro,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";

const obras = [
  {
    id: 1,
    titulo: "Pintura Exterior do Edifício",
    descricao:
      "Renovação completa da pintura exterior com tratamento anti-humidade para prevenir infiltrações e melhorar a estética do edifício.",
    valor: 15000,
    dataInicio: "2026-03-01",
    dataFim: "2026-04-15",
    estado: "proposta",
    votacao: { sim: 28, nao: 5, abstencoes: 15 },
    meuVoto: null,
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
    meuVoto: "sim",
  },
  {
    id: 3,
    titulo: "Instalação de Painéis Solares",
    descricao:
      "Sistema fotovoltaico para áreas comuns, reduzindo custos de energia elétrica",
    valor: 25000,
    dataInicio: "2026-05-01",
    dataFim: "2026-06-30",
    estado: "aprovada",
    votacao: { sim: 38, nao: 8, abstencoes: 2 },
    meuVoto: "sim",
  },
];

export function UserObras() {
  const [selectedObra, setSelectedObra] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [votoSelecionado, setVotoSelecionado] = useState<{ [key: number]: string }>({});

  const handleVotar = (obraId: number, voto: string) => {
    setVotoSelecionado({ ...votoSelecionado, [obraId]: voto });
    // In production, this would send to API
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "proposta":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            Votação Aberta
          </Badge>
        );
      case "aprovada":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Aprovada
          </Badge>
        );
      case "execucao":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Em Execução
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Obras</h1>
        <p className="text-gray-600 mt-1">
          Acompanhe e vote nas propostas de obras
        </p>
      </div>

      {/* Obras List */}
      <div className="space-y-4">
        {obras.map((obra) => {
          const totalVotos =
            obra.votacao.sim + obra.votacao.nao + obra.votacao.abstencoes;
          const percentagemSim = ((obra.votacao.sim / totalVotos) * 100).toFixed(0);
          const meuVoto = votoSelecionado[obra.id] || obra.meuVoto;

          return (
            <div
              key={obra.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {obra.titulo}
                      </h2>
                      {getEstadoBadge(obra.estado)}
                    </div>
                    <p className="text-gray-600">{obra.descricao}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Valor</p>
                      <p className="font-semibold text-gray-900">
                        €{obra.valor.toLocaleString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Início</p>
                      <p className="font-medium text-gray-900">
                        {new Date(obra.dataInicio).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fim Previsto</p>
                      <p className="font-medium text-gray-900">
                        {new Date(obra.dataFim).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voting Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                      Resultados da Votação
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({totalVotos} votos • {percentagemSim}% aprovação)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <ThumbsUp className="h-4 w-4" />
                        <p className="text-sm font-medium">A Favor</p>
                      </div>
                      <p className="text-2xl font-semibold text-green-700">
                        {obra.votacao.sim}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <ThumbsDown className="h-4 w-4" />
                        <p className="text-sm font-medium">Contra</p>
                      </div>
                      <p className="text-2xl font-semibold text-red-700">
                        {obra.votacao.nao}
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm font-medium">Abstenções</p>
                      </div>
                      <p className="text-2xl font-semibold text-gray-700">
                        {obra.votacao.abstencoes}
                      </p>
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  {obra.estado === "proposta" && (
                    <>
                      {!meuVoto ? (
                        <div className="flex flex-col md:flex-row gap-3">
                          <Button
                            onClick={() => handleVotar(obra.id, "sim")}
                            className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Votar A Favor
                          </Button>
                          <Button
                            onClick={() => handleVotar(obra.id, "nao")}
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-2"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Votar Contra
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                          <p className="text-sm text-blue-900">
                            Você votou{" "}
                            <strong>
                              {meuVoto === "sim" ? "A Favor" : "Contra"}
                            </strong>{" "}
                            desta proposta
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <button
                  onClick={() =>
                    setSelectedObra(selectedObra === obra.id ? null : obra.id)
                  }
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">
                    {selectedObra === obra.id ? "Ocultar" : "Ver"} Comentários (3)
                  </span>
                </button>

                {selectedObra === obra.id && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Maria Santos • Fração 1B
                        </p>
                        <p className="text-sm text-gray-600">
                          Excelente proposta! A pintura está mesmo a precisar.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Carlos Oliveira • Fração 3A
                        </p>
                        <p className="text-sm text-gray-600">
                          Podemos ter orçamentos de outras empresas?
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        className="mb-2"
                      />
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Publicar Comentário
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
