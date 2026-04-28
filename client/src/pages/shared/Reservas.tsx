import { useReservations, useUsers, useUpdateReservation, useCreateReservation } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Check, X, Waves, Dumbbell, PartyPopper } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReservationSchema, type InsertReservation } from "@/shared/schema";
import { useState } from "react";

const AREAS = [
  { key: "pool", label: "Piscina", icon: Waves, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { key: "gym", label: "Ginásio", icon: Dumbbell, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { key: "party_room", label: "Salão de Festas", icon: PartyPopper, color: "bg-purple-100 text-purple-700 border-purple-200" },
];

export function Reservas() {
  const { data: reservations, isLoading } = useReservations();
  const { data: users } = useUsers();
  const { user } = useAuth();
  const { mutate: updateRes, isPending } = useUpdateReservation();
  const createRes = useCreateReservation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const isAdmin = user?.role === "admin";

  const form = useForm<InsertReservation>({
    resolver: zodResolver(insertReservationSchema),
    defaultValues: {
      userId: user?.id,
      area: "pool",
      status: "pending",
      date: new Date(),
    },
  });

  const onSubmit = (data: InsertReservation) => {
    createRes.mutate({ ...data, userId: user?.id }, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Reserva solicitada com sucesso." });
        setOpen(false);
        form.reset();
      },
    });
  };

  const handleUpdate = (id: number, status: string) => {
    updateRes({ id, status }, {
      onSuccess: () => toast({ title: "Reserva atualizada", description: `Estado alterado para ${status}` })
    });
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = (startOfMonth(currentMonth).getDay() + 6) % 7;

  const getReservationsForDay = (day: Date) =>
    reservations?.filter(r => isSameDay(new Date(r.date), day)) || [];

  const selectedDayReservations = selectedDay ? getReservationsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Reservas de Espaços</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Gestão de pedidos de reserva." : "Reserva as áreas comuns do condomínio."}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Reserva</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área Comum</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREAS.map(a => <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" onChange={(e) => field.onChange(new Date(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createRes.isPending}>
                  {createRes.isPending ? "A processar..." : "Solicitar Reserva"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3">
        {AREAS.map(area => (
          <div key={area.key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${area.color}`}>
            <area.icon className="w-4 h-4" />
            {area.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2 p-6 border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 mb-2">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Dias */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const dayReservations = getReservationsForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const hasReservations = dayReservations.length > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay!) ? null : day)}
                  className={`relative p-2 rounded-lg min-h-[60px] text-left transition-all border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : isToday(day)
                      ? "bg-primary/10 border-primary/30"
                      : "hover:bg-secondary/50 border-transparent"
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? "text-primary-foreground" : isToday(day) ? "text-primary font-bold" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {hasReservations && (
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {dayReservations.slice(0, 3).map(r => {
                        const area = AREAS.find(a => a.key === r.area);
                        return (
                          <div
                            key={r.id}
                            className={`w-2 h-2 rounded-full ${
                              r.area === "pool" ? "bg-blue-500" :
                              r.area === "gym" ? "bg-emerald-500" : "bg-purple-500"
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Painel lateral */}
        <Card className="p-6 border-border/50">
          <h3 className="font-display font-bold text-lg mb-4">
            {selectedDay
              ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR })
              : "Selecione um dia"}
          </h3>

          {!selectedDay ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Clique num dia para ver as reservas.</p>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Próximas reservas</p>
                {reservations?.filter(r => new Date(r.date) >= new Date()).slice(0, 5).map(r => {
                  const area = AREAS.find(a => a.key === r.area);
                  const resUser = users?.find(u => u.id === r.userId);
                  return (
                    <div key={r.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${area?.color}`}>
                      {area && <area.icon className="w-3 h-3 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{area?.label}</p>
                        <p className="opacity-70">{format(new Date(r.date), "dd MMM HH:mm", { locale: ptBR })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedDayReservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem reservas para este dia.</p>
          ) : (
            <div className="space-y-3">
              {selectedDayReservations.map(r => {
                const area = AREAS.find(a => a.key === r.area);
                const resUser = users?.find(u => u.id === r.userId);
                return (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={`p-3 rounded-xl border ${area?.color}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {area && <area.icon className="w-4 h-4" />}
                          <span className="font-semibold text-sm">{area?.label}</span>
                        </div>
                        <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "outline"} className="text-xs">
                          {r.status === "approved" ? "Aprovado" : r.status === "rejected" ? "Rejeitado" : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-xs opacity-80">{format(new Date(r.date), "HH:mm", { locale: ptBR })}h</p>
                      {isAdmin && <p className="text-xs opacity-70 mt-1">Fração {resUser?.unit} — {resUser?.name}</p>}
                      {isAdmin && r.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => handleUpdate(r.id, "approved")} disabled={isPending}>
                            <Check className="w-3 h-3 mr-1" /> Aprovar
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-rose-600 hover:bg-rose-50 text-xs" onClick={() => handleUpdate(r.id, "rejected")} disabled={isPending}>
                            <X className="w-3 h-3 mr-1" /> Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
