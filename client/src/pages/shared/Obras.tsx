import { useWorks, useCreateWork, useDeleteWork, useUpdateWork, useUsers } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardHat, Plus, Calendar as CalendarIcon, DollarSign, Trash2, Users as UsersIcon, Info } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkSchema, type InsertWork, type Work, type User } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

export function Obras() {
  const { data: works, isLoading } = useWorks();
  const { data: users } = useUsers();
  const createWork = useCreateWork();
  const deleteWork = useDeleteWork();
  const updateWork = useUpdateWork();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [viewingWork, setViewingWork] = useState<Work | null>(null);
  const isAdmin = user?.role === "admin";

  const residents = users?.filter(u => u.role === 'user') || [];

  const form = useForm<InsertWork & { assignedUserIds: number[] }>({
    resolver: zodResolver(insertWorkSchema.extend({ assignedUserIds: z.array(z.number()).optional() })),
    defaultValues: {
      title: "",
      description: "",
      status: "planning",
      cost: "0",
      assignedUserIds: [],
    },
  });

  const onSubmit = (data: any) => {
    if (editingWork) {
      updateWork.mutate({ id: editingWork.id, ...data }, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Obra atualizada." });
          setOpen(false);
          setEditingWork(null);
          form.reset();
        }
      });
    } else {
      createWork.mutate(data, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Obra registada com sucesso." });
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    form.reset({
      title: work.title,
      description: work.description,
      status: work.status,
      cost: work.cost?.toString() || "0",
      assignedUserIds: work.assignedUserIds || [],
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem a certeza?")) {
      deleteWork.mutate(id, {
        onSuccess: () => toast({ title: "Sucesso", description: "Obra eliminada." })
      });
    }
  };

  const calculatePerUser = (cost: string | null | undefined, assignedCount: number) => {
    if (!cost || assignedCount === 0) return 0;
    return parseFloat(cost) / assignedCount;
  };

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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registar Nova Obra</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo Estimado (€)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assignedUserIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Condóminos Envolvidos</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                          {residents.map((res) => (
                            <FormField
                              key={res.id}
                              control={form.control}
                              name="assignedUserIds"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(res.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), res.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== res.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {res.unit} - {res.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createWork.isPending || updateWork.isPending}>
                    {createWork.isPending || updateWork.isPending ? "A guardar..." : editingWork ? "Atualizar Obra" : "Guardar Obra"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={!!viewingWork} onOpenChange={(o) => !o && setViewingWork(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingWork?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">{viewingWork?.description}</p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-primary">Informação Financeira</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Custo Total:</span>
                  <span className="font-bold">€{viewingWork?.cost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Condóminos Envolvidos:</span>
                  <span className="font-bold">{viewingWork?.assignedUserIds?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Cada Condómino Paga:</span>
                  <span className="font-bold text-primary">€{calculatePerUser(viewingWork?.cost, viewingWork?.assignedUserIds?.length || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            {viewingWork?.assignedUserIds && viewingWork.assignedUserIds.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold">Condóminos:</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingWork.assignedUserIds.map(uid => {
                    const u = users?.find(user => user.id === uid);
                    return u ? <Badge key={uid} variant="outline">{u.unit} - {u.name}</Badge> : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            <Card 
              className="flex flex-col h-full overflow-hidden border-border/50 hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => setViewingWork(work)}
            >
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
                <div className="bg-secondary/30 p-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => handleEdit(work)}>Editar Detalhes</Button>
                  <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => handleDelete(work.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
