import { useWorks, useCreateWork } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardHat, Plus, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export function Obras() {
  const { data: works, isLoading } = useWorks();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">Concluída</Badge>;
      case 'in_progress': return <Badge className="bg-primary/10 text-primary border-primary/20">Em Curso</Badge>;
      case 'planning': return <Badge variant="outline" className="text-muted-foreground">Em Planeamento</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Obras e Manutenção</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as intervenções no edifício.</p>
        </div>
        {isAdmin && (
          <Button className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Nova Obra
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : works?.map((work, index) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="flex flex-col h-full overflow-hidden border-border/50 hover:shadow-md transition-shadow group">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl group-hover:scale-110 transition-transform">
                    <HardHat className="w-6 h-6" />
                  </div>
                  {getStatusBadge(work.status)}
                </div>
                
                <h3 className="text-xl font-bold font-display mb-2">{work.title}</h3>
                <p className="text-muted-foreground text-sm flex-1 mb-6">
                  {work.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center text-sm text-foreground/80">
                    <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                    {work.startDate ? format(new Date(work.startDate), "dd MMM yyyy", { locale: ptBR }) : 'A definir'}
                    {work.endDate && ` - ${format(new Date(work.endDate), "dd MMM yyyy", { locale: ptBR })}`}
                  </div>
                  <div className="flex items-center text-sm text-foreground/80 font-medium">
                    <DollarSign className="w-4 h-4 mr-3 text-muted-foreground" />
                    {work.cost ? `€ ${parseFloat(work.cost.toString()).toLocaleString()}` : 'Orçamento a definir'}
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="bg-secondary/30 p-3 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-primary">Editar Detalhes</Button>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
