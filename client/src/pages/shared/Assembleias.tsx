import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Users, Calendar, Vote, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function Assembleias() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [selectedAssembleia, setSelectedAssembleia] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [allowedUsers, setAllowedUsers] = useState<number[]>([]);
  const isAdmin = user?.role === "admin";
  const condominos = users?.filter(u => u.userType === "condomino") || [];

  const { data: assembleias, isLoading } = useQuery({
    queryKey: ["/api/assembleias", user?.id, isAdmin],
    enabled: !!user,
    queryFn: async () => {
      const params = new URLSearchParams({ userId: String(user?.id ?? ""), isAdmin: String(isAdmin) });
      const res = await fetch("/api/assembleias?" + params.toString());
      if (!res.ok) return [];
      return res.json();
    },
  });

  // So mostra a condominos as assembleias em que estao incluidos (ou que
  // sejam abertas a todos, quando allowedUsers vem vazio/indefinido).
  // O admin ve sempre tudo.
  const visibleAssembleias = isAdmin
    ? assembleias
    : assembleias?.filter((a: any) => !a.allowedUsers || a.allowedUsers.length === 0 || a.allowedUsers.includes(user?.id));

  const { data: votacoes } = useQuery({
    queryKey: ["/api/assembleias/votacoes", selectedAssembleia?.id],
    enabled: !!selectedAssembleia,
    queryFn: async () => {
      const res = await fetch("/api/assembleias?resource=votacoes&assembleiaId=" + selectedAssembleia.id);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createAssembleia = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/assembleias", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assembleias"] });
      toast({ title: "Assembleia criada com sucesso." });
      setOpenNew(false);
      setTitle(""); setDescription(""); setDate(""); setAllowedUsers([]);
    },
  });

  const deleteAssembleia = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", "/api/assembleias?id=" + id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assembleias"] });
      setSelectedAssembleia(null);
      toast({ title: "Assembleia eliminada." });
    },
  });

  const createVotacao = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/assembleias?resource=votacoes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assembleias/votacoes", selectedAssembleia?.id] });
      setNewQuestion("");
      toast({ title: "Votacao adicionada." });
    },
  });

  const closeVotacao = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", "/api/assembleias?resource=votacoes&id=" + id, { status: "fechada" });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/assembleias/votacoes", selectedAssembleia?.id] }),
  });

  const updateStatus = async (status: string) => {
    await apiRequest("PUT", "/api/assembleias?id=" + selectedAssembleia.id, { status });
    queryClient.invalidateQueries({ queryKey: ["/api/assembleias"] });
    setSelectedAssembleia({ ...selectedAssembleia, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendada": return <Badge className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" />Agendada</Badge>;
      case "em_curso": return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><Vote className="w-3 h-3 mr-1" />Em Curso</Badge>;
      case "concluida": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" />Concluida</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const toggleUser = (id: number) => {
    setAllowedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Assembleias
          </h1>
          <p className="text-muted-foreground mt-1">Gestao de assembleias e votacoes online.</p>
        </div>
        {isAdmin && (
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Nova Assembleia</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nova Assembleia</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><label className="text-sm font-medium mb-1 block">Titulo</label><Input placeholder="Ex: Assembleia Ordinaria 2025" value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div><label className="text-sm font-medium mb-1 block">Data e Hora</label><Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div><label className="text-sm font-medium mb-1 block">Descricao</label><Textarea placeholder="Ordem de trabalhos..." value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Condominios com direito a voto</label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                    {condominos.length === 0 && <p className="text-sm text-muted-foreground">Sem condominios registados.</p>}
                    {condominos.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/30 rounded p-1">
                        <input type="checkbox" checked={allowedUsers.includes(c.id)} onChange={() => toggleUser(c.id)} className="rounded" />
                        <span className="text-sm">{c.name} - Fracao {c.unit}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Se nenhum for selecionado, todos podem votar.</p>
                </div>
                <Button className="w-full" disabled={!title || !date || createAssembleia.isPending} onClick={() => createAssembleia.mutate({ title, description, date, createdBy: user?.id, allowedUsers })}>
                  {createAssembleia.isPending ? "A criar..." : "Criar Assembleia"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {isLoading ? <p className="text-muted-foreground text-sm">A carregar...</p> :
          !visibleAssembleias || visibleAssembleias.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Sem assembleias agendadas.</p>
            </Card>
          ) : visibleAssembleias.map((a: any, i: number) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card
                className={"p-4 cursor-pointer transition-all hover:shadow-md border-2 " + (selectedAssembleia?.id === a.id ? "border-primary" : "border-transparent")}
                onClick={() => setSelectedAssembleia(a)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(a.date), "dd MMM yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {getStatusBadge(a.status)}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!selectedAssembleia ? (
            <Card className="p-12 text-center border-dashed h-full flex flex-col items-center justify-center">
              <Vote className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium">Selecione uma assembleia para ver os detalhes</p>
            </Card>
          ) : (
            <motion.div key={selectedAssembleia.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="p-6 border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display font-bold text-xl">{selectedAssembleia.title}</h2>
                    <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(selectedAssembleia.date), "dd 'de' MMMM 'de' yyyy 'as' HH:mm", { locale: ptBR })}
                    </p>
                    {selectedAssembleia.description && <p className="text-sm mt-2">{selectedAssembleia.description}</p>}
                    {selectedAssembleia.allowedUsers && selectedAssembleia.allowedUsers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Votantes:</span>
                        {selectedAssembleia.allowedUsers.map((uid: number) => {
                          const u = users?.find(u => u.id === uid);
                          return u ? <Badge key={uid} variant="outline" className="text-xs">{u.name}</Badge> : null;
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {getStatusBadge(selectedAssembleia.status)}
                    {isAdmin && selectedAssembleia.status === "agendada" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus("em_curso")}>Iniciar</Button>
                    )}
                    {isAdmin && selectedAssembleia.status === "em_curso" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus("concluida")}>Concluir</Button>
                    )}
                    {isAdmin && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => deleteAssembleia.mutate(selectedAssembleia.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Votacoes</h3>
                  {isAdmin && selectedAssembleia.status === "em_curso" && (
                    <div className="flex gap-2">
                      <Input placeholder="Nova questao..." value={newQuestion} onChange={e => setNewQuestion(e.target.value)} className="w-64 h-8 text-sm" />
                      <Button size="sm" disabled={!newQuestion} onClick={() => createVotacao.mutate({ assembleiaId: selectedAssembleia.id, question: newQuestion })}>
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {!votacoes || votacoes.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Sem votacoes criadas.</p>
                ) : (
                  <div className="space-y-4">
                    {votacoes.map((v: any) => (
                      <VotacaoItem
                        key={v.id}
                        votacao={v}
                        userId={user?.id || 0}
                        isAdmin={isAdmin}
                        onClose={() => closeVotacao.mutate(v.id)}
                        allowedUsers={selectedAssembleia.allowedUsers || []}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function VotacaoItem({ votacao, userId, isAdmin, onClose, allowedUsers }: {
  votacao: any; userId: number; isAdmin: boolean; onClose: () => void; allowedUsers: number[];
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: votos } = useQuery({
    queryKey: ["/api/assembleias/votos", votacao.id],
    queryFn: async () => {
      const res = await fetch("/api/assembleias?resource=votos&votacaoId=" + votacao.id);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 3000,
  });

  const meuVoto = votos?.find((v: any) => v.userId === userId);
  const totalSim = votos?.filter((v: any) => v.voto === "sim").length || 0;
  const totalNao = votos?.filter((v: any) => v.voto === "nao").length || 0;
  const totalAbstencao = votos?.filter((v: any) => v.voto === "abstencao").length || 0;
  const total = votos?.length || 0;
  const podeVotar = allowedUsers.length === 0 || allowedUsers.includes(userId);

  const votar = useMutation({
    mutationFn: async (voto: string) => {
      const res = await apiRequest("POST", "/api/assembleias?resource=votos", { votacaoId: votacao.id, userId, voto });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assembleias/votos", votacao.id] });
      toast({ title: "Voto registado com sucesso." });
    },
    onError: () => toast({ title: "Ja votou nesta votacao.", variant: "destructive" }),
  });

  return (
    <div className="border border-border/50 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-medium">{votacao.question}</p>
        <div className="flex items-center gap-2">
          <Badge className={votacao.status === "aberta" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-secondary text-muted-foreground"}>
            {votacao.status === "aberta" ? "Aberta" : "Fechada"}
          </Badge>
          {isAdmin && votacao.status === "aberta" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onClose}>Fechar</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-emerald-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-emerald-600">{totalSim}</p>
          <p className="text-xs text-emerald-600">Sim</p>
        </div>
        <div className="bg-rose-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-rose-600">{totalNao}</p>
          <p className="text-xs text-rose-600">Nao</p>
        </div>
        <div className="bg-secondary rounded-lg p-2 text-center">
          <p className="text-lg font-bold">{totalAbstencao}</p>
          <p className="text-xs text-muted-foreground">Abstencao</p>
        </div>
      </div>

      {total > 0 && (
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-3">
          <div className="h-full flex">
            <div className="bg-emerald-500 transition-all" style={{ width: (totalSim/total*100) + "%" }} />
            <div className="bg-rose-500 transition-all" style={{ width: (totalNao/total*100) + "%" }} />
          </div>
        </div>
      )}

      {votacao.status === "aberta" && !meuVoto && podeVotar && (
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => votar.mutate("sim")}>Sim</Button>
          <Button size="sm" variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => votar.mutate("nao")}>Nao</Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => votar.mutate("abstencao")}>Abstencao</Button>
        </div>
      )}
      {votacao.status === "aberta" && !meuVoto && !podeVotar && (
        <p className="text-xs text-muted-foreground text-center py-1">Nao tem permissao para votar nesta assembleia.</p>
      )}
      {meuVoto && (
        <p className="text-xs text-muted-foreground text-center py-1">
          O seu voto: <span className="font-bold">{meuVoto.voto === "sim" ? "Sim" : meuVoto.voto === "nao" ? "Nao" : "Abstencao"}</span>
        </p>
      )}
    </div>
  );
}