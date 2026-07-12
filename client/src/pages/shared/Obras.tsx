import { useWorks, useCreateWork, useDeleteWork, useUpdateWork, useUsers } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardHat, Plus, Calendar as CalendarIcon, DollarSign, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkSchema, type InsertWork, type Work } from "@/shared/schema";
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
  const isAdmin = user?.role === "admin";

  const residents = (users?.filter(u => u.userType === "condomino" && u.username !== "admin" && u.username !== "sistema") || [])
    .sort((a, b) => (a.unit || "").localeCompare(b.unit || ""));

  const filteredWorks = isAdmin
    ? works
    : works?.filter(w => w.assignedUserIds?.includes(user?.id || 0)) || [];

  const form = useForm<any>({
    resolver: zodResolver(insertWorkSchema.extend({ assignedUserIds: z.array(z.number()).optional() })),
    defaultValues: { title: "", description: "", status: "planning", cost: "0", assignedUserIds: [] },
  });

  const onSubmit = (data: any) => {
    if (editingWork) {
      updateWork.mutate({ id: editingWork.id, ...data }, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Obra atualizada." });
          setOpen(false);
          setEditingWork(null);
          form.reset();
        },
        onError: (err: any) => toast({ title: "Erro ao atualizar", description: err?.message || "Nao foi possivel atualizar a obra.", variant: "destructive" })
      });
    } else {
      createWork.mutate(data, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Obra registada." });
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  const handleEdit = (e: React.MouseEvent, work: Work) => {
    e.stopPropagation();
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

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Tem a certeza?")) {
      deleteWork.mutate(id, {
        onSuccess: () => toast({ title: "Sucesso", description: "Obra eliminada." })
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">Concluida</Badge>;
      case "in_progress": return <Badge className="bg-primary/10 text-primary border-primary/20">Em Curso</Badge>;
      case "planning": return <Badge variant="outline" className="text-muted-foreground">Em Planeamento</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Obras e Manutencao</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as intervencoes no edificio.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditingWork(null); form.reset(); } }}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Nova Obra</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWork ? "Editar Obra" : "Registar Nova Obra"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Titulo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descricao</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="planning">Em Planeamento</SelectItem>
                          <SelectItem value="in_progress">Em Curso</SelectItem>
                          <SelectItem value="completed">Concluida</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cost" render={({ field }) => (
                    <FormItem><FormLabel>Custo Estimado (EUR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="assignedUserIds" render={() => (
                    <FormItem>
                      <FormLabel>Proprietarios Envolvidos ({residents.length})</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {residents.length === 0 && <p className="col-span-2 text-sm text-muted-foreground py-2 text-center">Nenhum proprietario registado.</p>}
                        {residents.map((res) => (
                          <FormField key={res.id} control={form.control} name="assignedUserIds" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(res.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), res.id])
                                      : field.onChange(field.value?.filter((v: any) => v !== res.id))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal flex items-center gap-2">
                                <span>{res.unit} - {res.name}</span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">Proprietario</Badge>
                              </FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={createWork.isPending || updateWork.isPending}>
                    {createWork.isPending || updateWork.isPending ? "A guardar..." : editingWork ? "Atualizar Obra" : "Guardar Obra"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : (filteredWorks ?? []).length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            {isAdmin ? "Nenhuma obra registada." : "Nao tem obras associadas."}
          </div>
        ) : filteredWorks?.map((work, index) => (
          <motion.div key={work.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
            <Card className="flex flex-col h-full overflow-hidden border-border/50 hover:shadow-md transition-shadow">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl">
                    <HardHat className="w-6 h-6" />
                  </div>
                  {getStatusBadge(work.status)}
                </div>
                <h3 className="text-xl font-bold font-display mb-2">{work.title}</h3>
                <p className="text-muted-foreground text-sm flex-1 mb-6">{work.description}</p>
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center text-sm text-foreground/80">
                    <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                    {work.startDate ? format(new Date(work.startDate), "dd MMM yyyy", { locale: ptBR }) : "A definir"}
                    {work.endDate && ` - ${format(new Date(work.endDate), "dd MMM yyyy", { locale: ptBR })}`}
                  </div>
                  <div className="flex items-center text-sm text-foreground/80 font-medium">
                    <DollarSign className="w-4 h-4 mr-3 text-muted-foreground" />
                    {work.cost ? `EUR ${parseFloat(work.cost.toString()).toLocaleString()}` : "Orcamento a definir"}
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="bg-secondary/30 p-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="text-primary" onClick={(e) => handleEdit(e, work)}>
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-rose-500" onClick={(e) => handleDelete(e, work.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}