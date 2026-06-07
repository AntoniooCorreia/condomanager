import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Megaphone, AlertTriangle, Info, HardHat, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = [
  { key: "urgente", label: "Urgente", color: "bg-rose-50 text-rose-700 border-rose-200", border: "border-l-rose-500", icon: AlertTriangle },
  { key: "obras", label: "Obras", color: "bg-amber-50 text-amber-700 border-amber-200", border: "border-l-amber-500", icon: HardHat },
  { key: "informativo", label: "Informativo", color: "bg-blue-50 text-blue-700 border-blue-200", border: "border-l-blue-500", icon: Info },
  { key: "geral", label: "Geral", color: "bg-secondary text-foreground border-border", border: "border-l-primary", icon: Megaphone },
  { key: "convocatoria", label: "Convocatoria", color: "bg-purple-50 text-purple-700 border-purple-200", border: "border-l-purple-500", icon: Users },
];

const SISTEMA_ID = 14;

async function sendSystemMessage(receiverId: number, content: string) {
  try {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: SISTEMA_ID, receiverId, content })
    });
  } catch (e) {}
}

export function Avisos() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openConvocatoria, setOpenConvocatoria] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("informativo");
  const [filter, setFilter] = useState("todos");

  // Convocatoria fields
  const [convData, setConvData] = useState({
    date: "", time: "", location: "", agenda: "", secondDate: "", selectedUsers: [] as number[]
  });

  const isAdmin = user?.role === "admin";
  const condominos = users?.filter(u => u.userType === "condomino" || u.userType === "arrendatario") || [];

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
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Aviso publicado com sucesso." });
      setOpen(false);
      setTitle(""); setContent(""); setCategory("informativo");
      if (users) {
        users.filter(u => u.username !== "sistema" && u.id !== user?.id).forEach(u => {
          sendSystemMessage(u.id, "Novo aviso no quadro: " + data.title + ". " + data.content);
        });
      }
    },
  });

  const createConvocatoria = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/announcements", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Convocatoria enviada com sucesso." });
      setOpenConvocatoria(false);
      setConvData({ date: "", time: "", location: "", agenda: "", secondDate: "", selectedUsers: [] });
      convData.selectedUsers.forEach(uid => {
        const u = users?.find(u => u.id === uid);
        if (u) {
          sendSystemMessage(uid,
            "Foi convocado para uma Assembleia de Condominios.\n" +
            "Data: " + convData.date + " as " + convData.time + "\n" +
            "Local: " + convData.location + "\n" +
            "Ordem de trabalhos:\n" + convData.agenda +
            (convData.secondDate ? "\n\nSegunda convocatoria: " + convData.secondDate : "")
          );
        }
      });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", "/api/announcements?id=" + id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Aviso removido." });
    },
  });

  const toggleUser = (id: number) => {
    setConvData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(id)
        ? prev.selectedUsers.filter(u => u !== id)
        : [...prev.selectedUsers, id]
    }));
  };

  const selectAll = () => {
    setConvData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.length === condominos.length ? [] : condominos.map(c => c.id)
    }));
  };

  const submitConvocatoria = () => {
    if (!convData.date || !convData.time || !convData.location || !convData.agenda) {
      toast({ title: "Preencha todos os campos obrigatorios.", variant: "destructive" });
      return;
    }
    if (convData.selectedUsers.length === 0) {
      toast({ title: "Selecione pelo menos um condomino.", variant: "destructive" });
      return;
    }

    const convocados = convData.selectedUsers.map(uid => {
      const u = users?.find(u => u.id === uid);
      return u ? u.name + " (Fracao " + u.unit + ")" : "";
    }).filter(Boolean).join(", ");

    const contentText =
      "Nos termos do Art. 1432 do Codigo Civil, convocam-se os condominios para Assembleia.\n\n" +
      "Data: " + convData.date + " as " + convData.time + "\n" +
      "Local: " + convData.location + "\n\n" +
      "Ordem de Trabalhos:\n" + convData.agenda +
      (convData.secondDate ? "\n\nSegunda convocatoria (caso nao haja quorum): " + convData.secondDate : "") +
      "\n\nConvocados: " + convocados;

    createConvocatoria.mutate({
      title: "Convocatoria - Assembleia de " + convData.date,
      content: contentText,
      category: "convocatoria",
      createdBy: user?.id
    });
  };

  const filtered = filter === "todos"
    ? announcements
    : announcements?.filter((a: any) => a.category === filter);

  // Para nao admins: mostrar apenas avisos gerais + convocatorias onde o user foi mencionado
  const visibleAnnouncements = isAdmin ? filtered : filtered?.filter((a: any) => {
    if (a.category !== "convocatoria") return true;
    return a.content?.includes(users?.find(u => u.id === user?.id)?.name || "");
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" />
            Quadro de Avisos
          </h1>
          <p className="text-muted-foreground mt-1">Informacoes, comunicados e convocatorias do condominio.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {/* Convocatoria */}
            <Dialog open={openConvocatoria} onOpenChange={setOpenConvocatoria}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Users className="w-4 h-4 mr-2" /> Convocatoria
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Criar Convocatoria</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium mb-1 block">Data da Reuniao *</label><Input type="date" value={convData.date} onChange={e => setConvData(p => ({...p, date: e.target.value}))} /></div>
                    <div><label className="text-sm font-medium mb-1 block">Hora *</label><Input type="time" value={convData.time} onChange={e => setConvData(p => ({...p, time: e.target.value}))} /></div>
                  </div>
                  <div><label className="text-sm font-medium mb-1 block">Local *</label><Input placeholder="Ex: Sala de reunioes do predio" value={convData.location} onChange={e => setConvData(p => ({...p, location: e.target.value}))} /></div>
                  <div><label className="text-sm font-medium mb-1 block">Ordem de Trabalhos *</label>
                    <Textarea placeholder={"1. Aprovacao de Contas.\n2. Orcamento para o Ano seguinte.\n3. Eleicao da proxima Administracao.\n4. Assuntos que os Condominios queiram discutir."} value={convData.agenda} onChange={e => setConvData(p => ({...p, agenda: e.target.value}))} rows={5} />
                  </div>
                  <div><label className="text-sm font-medium mb-1 block">Segunda Convocatoria (opcional)</label><Input type="date" value={convData.secondDate} onChange={e => setConvData(p => ({...p, secondDate: e.target.value}))} /></div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Condominios a Convocar *</label>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={selectAll}>
                        {convData.selectedUsers.length === condominos.length ? "Desselecionar Todos" : "Selecionar Todos"}
                      </Button>
                    </div>
                    <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                      {condominos.length === 0 && <p className="text-sm text-muted-foreground">Sem condominios registados.</p>}
                      {condominos.map(c => (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/30 rounded p-1">
                          <input type="checkbox" checked={convData.selectedUsers.includes(c.id)} onChange={() => toggleUser(c.id)} className="rounded" />
                          <span className="text-sm">{c.name} - Fracao {c.unit}</span>
                          <Badge className="text-xs ml-auto">{c.userType === "condomino" ? "Proprietario" : "Arrendatario"}</Badge>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{convData.selectedUsers.length} selecionado(s)</p>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={createConvocatoria.isPending} onClick={submitConvocatoria}>
                    {createConvocatoria.isPending ? "A enviar..." : "Enviar Convocatoria"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Aviso normal */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Novo Aviso</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Publicar Novo Aviso</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><label className="text-sm font-medium mb-1 block">Titulo</label><Input placeholder="Ex: Interrupcao de agua" value={title} onChange={e => setTitle(e.target.value)} /></div>
                  <div><label className="text-sm font-medium mb-1 block">Categoria</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.filter(c => c.key !== "convocatoria").map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-sm font-medium mb-1 block">Mensagem</label><Textarea placeholder="Descricao do aviso..." value={content} onChange={e => setContent(e.target.value)} rows={4} /></div>
                  <Button className="w-full" disabled={!title || !content || createAnnouncement.isPending} onClick={() => createAnnouncement.mutate({ title, content, category, createdBy: user?.id })}>
                    {createAnnouncement.isPending ? "A publicar..." : "Publicar Aviso"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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

      {/* Lista */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : !visibleAnnouncements || visibleAnnouncements.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Sem avisos publicados.</p>
          </Card>
        ) : visibleAnnouncements.map((aviso: any, i: number) => {
          const cat = CATEGORIES.find(c => c.key === aviso.category) || CATEGORIES[3];
          return (
            <motion.div key={aviso.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={"p-5 border-l-4 " + cat.border}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={"p-2 rounded-lg border flex-shrink-0 " + cat.color}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">{aviso.title}</h3>
                        <Badge className={"text-xs " + cat.color}>{cat.label}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{aviso.content}</p>
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