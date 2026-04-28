import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Megaphone, AlertTriangle, Info, HardHat } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { key: "urgente", label: "Urgente", color: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertTriangle },
  { key: "obras", label: "Obras", color: "bg-amber-50 text-amber-700 border-amber-200", icon: HardHat },
  { key: "informativo", label: "Informativo", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Info },
  { key: "geral", label: "Geral", color: "bg-secondary text-foreground border-border", icon: Megaphone },
];

export function Avisos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("informativo");
  const [filter, setFilter] = useState("todos");
  const isAdmin = user?.role === "admin";

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: async () => {
      const res = await fetch("/api/announcements");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Aviso publicado com sucesso." });
      setOpen(false);
      setTitle("");
      setContent("");
      setCategory("informativo");
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/announcements?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Aviso removido." });
    },
  });

  const filtered = filter === "todos"
    ? announcements
    : announcements?.filter((a: any) => a.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" />
            Quadro de Avisos
          </h1>
          <p className="text-muted-foreground mt-1">Informacoes e comunicados do condominio.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> Novo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publicar Novo Aviso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Titulo</label>
                  <Input placeholder="Ex: Interrupcao de agua" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Categoria</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Mensagem</label>
                  <Textarea placeholder="Descricao do aviso..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
                </div>
                <Button className="w-full" disabled={!title || !content || createAnnouncement.isPending} onClick={() => createAnnouncement.mutate({ title, content, category, createdBy: user?.id })}>
                  {createAnnouncement.isPending ? "A publicar..." : "Publicar Aviso"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "todos" ? "default" : "outline"} size="sm" onClick={() => setFilter("todos")}>Todos</Button>
        {CATEGORIES.map(c => (
          <Button key={c.key} variant={filter === c.key ? "default" : "outline"} size="sm" onClick={() => setFilter(c.key)}>
            <c.icon className="w-3.5 h-3.5 mr-1.5" />{c.label}
          </Button>
        ))}
      </div>

      {/* Lista de avisos */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : !filtered || filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Sem avisos publicados.</p>
          </Card>
        ) : filtered.map((aviso: any, i: number) => {
          const cat = CATEGORIES.find(c => c.key === aviso.category) || CATEGORIES[3];
          return (
            <motion.div key={aviso.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`p-5 border-l-4 ${aviso.category === "urgente" ? "border-l-rose-500" : aviso.category === "obras" ? "border-l-amber-500" : aviso.category === "informativo" ? "border-l-blue-500" : "border-l-primary"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg border ${cat.color} flex-shrink-0`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">{aviso.title}</h3>
                        <Badge className={`text-xs ${cat.color}`}>{cat.label}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{aviso.content}</p>
                      <p className="text-xs text-muted-foreground mt-3">
                        {format(new Date(aviso.createdAt), "dd 'de' MMMM 'de' yyyy 'as' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-700 flex-shrink-0" onClick={() => deleteAnnouncement.mutate(aviso.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}