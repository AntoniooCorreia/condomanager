import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const espacos = [
  { id: 1, nome: "Campo de Ténis", cor: "blue" },
  { id: 2, nome: "Sauna", cor: "purple" },
  { id: 3, nome: "Sala de Condomínio", cor: "green" },
];

const reservas = [
  {
    id: 1,
    espacoId: 1,
    fracao: "2A",
    nome: "Pedro Costa",
    data: "2026-02-12",
    horaInicio: "14:00",
    horaFim: "16:00",
  },
  {
    id: 2,
    espacoId: 2,
    fracao: "1B",
    nome: "Maria Santos",
    data: "2026-02-12",
    horaInicio: "19:00",
    horaFim: "20:00",
  },
  {
    id: 3,
    espacoId: 1,
    fracao: "3A",
    nome: "Carlos Oliveira",
    data: "2026-02-13",
    horaInicio: "10:00",
    horaFim: "12:00",
  },
  {
    id: 4,
    espacoId: 3,
    fracao: "4B",
    nome: "Teresa Alves",
    data: "2026-02-15",
    horaInicio: "15:00",
    horaFim: "18:00",
  },
  {
    id: 5,
    espacoId: 2,
    fracao: "2B",
    nome: "Ana Rodrigues",
    data: "2026-02-15",
    horaInicio: "20:00",
    horaFim: "21:00",
  },
];

const horarios = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];

export function Reservas() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 12)); // Feb 12, 2026
  const [viewType, setViewType] = useState<"calendar" | "list">("calendar");

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

  const dateString = selectedDate.toISOString().split("T")[0];
  const reservasHoje = reservas.filter((r) => r.data === dateString);

  const getEspacoCor = (espacoId: number) => {
    const espaco = espacos.find((e) => e.id === espacoId);
    return espaco?.cor || "gray";
  };

  const corClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    green: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Reservas de Espaços Comuns
          </h1>
          <p className="text-gray-600 mt-1">
            Gestão de reservas e disponibilidade
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Espaços */}
      <div className="flex flex-wrap gap-3">
        {espacos.map((espaco) => {
          const cor = espaco.cor as keyof typeof corClasses;
          return (
            <div
              key={espaco.id}
              className={`px-4 py-2 rounded-lg border ${corClasses[cor]}`}
            >
              <span className="font-medium">{espaco.nome}</span>
            </div>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewType === "calendar" ? "default" : "outline"}
          onClick={() => setViewType("calendar")}
          className={viewType === "calendar" ? "bg-blue-600" : ""}
        >
          Calendário
        </Button>
        <Button
          variant={viewType === "list" ? "default" : "outline"}
          onClick={() => setViewType("list")}
          className={viewType === "list" ? "bg-blue-600" : ""}
        >
          Lista
        </Button>
      </div>

      {viewType === "calendar" ? (
        <>
          {/* Date Navigation */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString("pt-PT", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={nextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="font-medium text-gray-600">Horário</div>
                {espacos.map((espaco) => (
                  <div key={espaco.id} className="font-medium text-gray-600 text-center">
                    {espaco.nome}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                {horarios.map((horario) => (
                  <div key={horario} className="grid grid-cols-4 gap-4">
                    <div className="text-sm text-gray-600 py-3">{horario}</div>
                    {espacos.map((espaco) => {
                      const reserva = reservasHoje.find(
                        (r) =>
                          r.espacoId === espaco.id &&
                          r.horaInicio <= horario &&
                          r.horaFim > horario
                      );
                      const cor = espaco.cor as keyof typeof corClasses;

                      return (
                        <div key={espaco.id} className="relative">
                          {reserva ? (
                            <div
                              className={`p-2 rounded-lg border ${corClasses[cor]} h-full`}
                            >
                              <p className="text-xs font-medium truncate">
                                {reserva.nome}
                              </p>
                              <p className="text-xs opacity-75">
                                {reserva.fracao}
                              </p>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer h-full transition-colors">
                              <p className="text-xs text-gray-400 text-center">
                                Disponível
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Todas as Reservas
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {reservas.map((reserva) => {
              const espaco = espacos.find((e) => e.id === reserva.espacoId);
              const cor = (espaco?.cor || "gray") as keyof typeof corClasses;

              return (
                <div
                  key={reserva.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={corClasses[cor]}>
                          {espaco?.nome}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(reserva.data).toLocaleDateString("pt-PT", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {reserva.nome} • Fração {reserva.fracao}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {reserva.horaInicio} - {reserva.horaFim}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
