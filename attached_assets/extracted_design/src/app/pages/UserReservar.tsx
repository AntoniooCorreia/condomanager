import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const espacos = [
  {
    id: 1,
    nome: "Campo de Ténis",
    descricao: "Campo coberto com equipamento disponível",
    cor: "blue",
    icon: "🎾",
  },
  {
    id: 2,
    nome: "Sauna",
    descricao: "Capacidade para 4 pessoas",
    cor: "purple",
    icon: "🧖",
  },
  {
    id: 3,
    nome: "Sala de Condomínio",
    descricao: "Capacidade para 30 pessoas",
    cor: "green",
    icon: "🏛️",
  },
];

const horarios = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

// Mock reservations to show availability
const reservasExistentes = [
  { espacoId: 1, data: "2026-02-12", horaInicio: "14:00", horaFim: "16:00" },
  { espacoId: 2, data: "2026-02-12", horaInicio: "19:00", horaFim: "20:00" },
];

export function UserReservar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 12));
  const [selectedEspaco, setSelectedEspaco] = useState<number | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<string | null>(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const isHorarioDisponivel = (espacoId: number, horario: string) => {
    const dateString = selectedDate.toISOString().split("T")[0];
    return !reservasExistentes.some(
      (r) =>
        r.espacoId === espacoId &&
        r.data === dateString &&
        horario >= r.horaInicio &&
        horario < r.horaFim
    );
  };

  const handleReservar = () => {
    setShowConfirmacao(true);
    setTimeout(() => {
      setShowConfirmacao(false);
      setSelectedEspaco(null);
      setSelectedHorario(null);
    }, 3000);
  };

  const espacoSelecionado = espacos.find((e) => e.id === selectedEspaco);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Reservar Espaço
        </h1>
        <p className="text-gray-600 mt-1">
          Escolha o espaço, data e horário desejado
        </p>
      </div>

      {/* Success Message */}
      {showConfirmacao && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-medium text-green-900">
              Reserva confirmada com sucesso!
            </h3>
            <p className="text-sm text-green-700">
              Receberá uma confirmação por email.
            </p>
          </div>
        </div>
      )}

      {/* Step 1: Select Space */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          1. Escolha o Espaço
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {espacos.map((espaco) => (
            <button
              key={espaco.id}
              onClick={() => setSelectedEspaco(espaco.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedEspaco === espaco.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="text-3xl mb-2">{espaco.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {espaco.nome}
              </h3>
              <p className="text-sm text-gray-600">{espaco.descricao}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Date */}
      {selectedEspaco && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            2. Escolha a Data
          </h2>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <Button variant="outline" size="sm" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {selectedDate.toLocaleDateString("pt-PT", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Time */}
      {selectedEspaco && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            3. Escolha o Horário
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {horarios.map((horario) => {
              const disponivel = isHorarioDisponivel(selectedEspaco, horario);
              return (
                <button
                  key={horario}
                  onClick={() =>
                    disponivel && setSelectedHorario(horario)
                  }
                  disabled={!disponivel}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    selectedHorario === horario
                      ? "border-blue-500 bg-blue-50"
                      : disponivel
                      ? "border-gray-200 hover:border-blue-200"
                      : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{horario}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
            <span>ℹ️</span>
            <p>
              As reservas têm duração de 1 hora. Horários a cinzento já estão
              reservados.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation */}
      {selectedEspaco && selectedHorario && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Confirmação da Reserva
          </h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Espaço:</span>
              <span className="font-medium text-gray-900">
                {espacoSelecionado?.icon} {espacoSelecionado?.nome}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data:</span>
              <span className="font-medium text-gray-900">
                {selectedDate.toLocaleDateString("pt-PT", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Horário:</span>
              <span className="font-medium text-gray-900">
                {selectedHorario} - {parseInt(selectedHorario) + 1}:00
              </span>
            </div>
          </div>
          <Button
            onClick={handleReservar}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Confirmar Reserva
          </Button>
        </div>
      )}
    </div>
  );
}
