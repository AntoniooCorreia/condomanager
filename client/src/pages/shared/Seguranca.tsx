import { useSecurityLogs, useUsers, useUpdateSecurityLog, useCreateSecurityLog } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, Plus, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { motion } from "framer-motion";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSecurityLogSchema, type InsertSecurityLog } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Seguranca() {
  const { data: logs, isLoading } = useSecurityLogs();
  const { data: users } = useUsers();
  const { user } = useAuth();
  const createLog = useCreateSecurityLog();
  const updateLog = useUpdateSecurityLog();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const form = useForm<InsertSecurityLog>({
    resolver: zodResolver(insertSecurityLogSchema),
    defaultValues: {
      reportedBy: user?.id,
      description: "",
      status: "open",
    },
  });

  const onSubmit = (data: InsertSecurityLog) => {
    createLog.mutate({ ...data, reportedBy: user?.id }, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Ocorrência reportada." });
        setOpen(false);
        form.reset();
      },
    });
  };

  const handleResolve = (id: number) => {
    updateLog.mutate({ id, status: "resolved" }, {
      onSuccess: () => toast({ title: "Sucesso", description: "Ocorrência marcada como resolvida." }),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Ocorrências
          </h1>
          <p className="text-muted-foreground mt-1">Registo de incidentes e alertas de segurança.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 bg-rose-600 hover:bg-rose-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Reportar Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reportar Nova Ocorrência</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Incidente</FormLabel>
                      <FormControl><Textarea placeholder="Descreva o que aconteceu..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white" disabled={createLog.isPending}>
                  {createLog.isPending ? "A enviar..." : "Enviar Alerta"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? <p>A carregar...</p> : logs?.map((log, i) => {
          const reporter = users?.find(u => u.id === log.reportedBy);
          const isOpen = log.status === 'open';
          
          return (
            <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`p-5 flex flex-col md:flex-row gap-6 items-start md:items-center border-l-4 transition-all hover:shadow-md ${isOpen ? 'border-l-rose-500 bg-rose-50/30' : 'border-l-emerald-500'}`}>
                <div className={`p-3 rounded-full ${isOpen ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isOpen ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className={isOpen ? 'text-rose-600 border-rose-200 bg-white' : 'text-emerald-600 border-emerald-200 bg-white'}>
                      {isOpen ? 'Em Aberto' : 'Resolvido'}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-medium">
                      {format(new Date(log.date), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-lg text-foreground font-medium">{log.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Reportado por: <span className="font-semibold">{reporter ? `Fração ${reporter.unit} (${reporter.name})` : 'Sistema/Câmaras'}</span>
                  </p>
                </div>

                {isAdmin && isOpen && (
                  <Button 
                    variant="outline" 
                    className="shrink-0 border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => handleResolve(log.id)}
                    disabled={updateLog.isPending}
                  >
                    Marcar Resolvido
                  </Button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
