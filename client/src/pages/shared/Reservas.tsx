import { useReservations, useUsers, useUpdateReservation } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Check, X, Plus } from "lucide-react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const AREA_LABELS: Record<string, string> = {
  pool: "Piscina",
  gym: "Ginásio",
  party_room: "Salão de Festas"
};

export function Reservas() {
  const { data: reservations, isLoading } = useReservations();
  const { data: users } = useUsers();
  const { user } = useAuth();
  const { mutate: updateRes, isPending } = useUpdateReservation();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const displayedReservations = isAdmin 
    ? reservations 
    : reservations?.filter(r => r.userId === user?.id);

  const handleUpdate = (id: number, status: string) => {
    updateRes({ id, status }, {
      onSuccess: () => toast({ title: "Reserva atualizada", description: `Estado alterado para ${status}` })
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Reservas de Espaços</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Gestão de pedidos de reserva." : "As suas reservas de áreas comuns."}
          </p>
        </div>
        {!isAdmin && (
          <Button className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Nova Reserva
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <p className="text-muted-foreground">A carregar...</p> : displayedReservations?.map((res, i) => {
          const resUser = users?.find(u => u.id === res.userId);
          return (
            <motion.div key={res.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-6 border-border/50 hover:border-primary/20 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg">{AREA_LABELS[res.area] || res.area}</h3>
                    {isAdmin && <p className="text-sm text-primary font-medium mt-1">Fração {resUser?.unit}</p>}
                  </div>
                  <Badge variant={res.status === 'approved' ? 'default' : res.status === 'rejected' ? 'destructive' : 'outline'}>
                    {res.status === 'approved' ? 'Aprovado' : res.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                  </Badge>
                </div>

                <div className="flex items-center text-muted-foreground mb-6 bg-secondary/50 p-3 rounded-lg">
                  <CalendarIcon className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider opacity-70 mb-0.5">Data & Hora</p>
                    <p className="font-medium text-foreground">{format(new Date(res.date), "dd 'de' MMM, HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>

                {isAdmin && res.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdate(res.id, 'approved')} disabled={isPending}>
                      <Check className="w-4 h-4 mr-2" /> Aprovar
                    </Button>
                    <Button variant="outline" className="flex-1 text-rose-600 hover:bg-rose-50" onClick={() => handleUpdate(res.id, 'rejected')} disabled={isPending}>
                      <X className="w-4 h-4 mr-2" /> Rejeitar
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
