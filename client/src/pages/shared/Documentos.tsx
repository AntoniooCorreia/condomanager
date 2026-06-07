import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-condominium";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, Download, Upload, BookOpen, FileCheck, File, Search, User, Calendar, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { key: "regulamento", label: "Regulamento", icon: BookOpen, color: "bg-blue-50 text-blue-700 border-blue-200", border: "border-l-blue-500" },
  { key: "ata", label: "Ata de Reuniao", icon: FileCheck, color: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "border-l-emerald-500" },
  { key: "seguro", label: "Seguro", icon: FileText, color: "bg-amber-50 text-amber-700 border-amber-200", border: "border-l-amber-500" },
  { key: "contrato", label: "Contrato", icon: File, color: "bg-purple-50 text-purple-700 border-purple-200", border: "border-l-purple-500" },
  { key: "geral", label: "Geral", icon: FileText, color: "bg-secondary text-foreground border-border", border: "border-l-primary" },
];

export function Documentos() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("geral");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("1.0");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resumeGenerating, setResumeGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role === "admin";

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const res = await fetch("/api/documents");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createDocument = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/documents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Documento publicado com sucesso." });
      setOpen(false);
      resetForm();
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", "/api/documents?id=" + id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Documento removido." });
    },
  });

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategory("geral");
    setContent(""); setFileUrl(null); setFileName(null); setVersion("1.0");
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const name = Date.now() + "." + ext;
      const { error } = await supabase.storage.from("documents").upload(name, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(name);
      setFileUrl(urlData.publicUrl);
      setFileName(file.name);
      toast({ title: "Ficheiro carregado com sucesso." });
    } catch {
      toast({ title: "Erro ao carregar ficheiro.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const generateResume = async () => {
    if (!content.trim()) {
      toast({ title: "Escreva o conteudo da ata primeiro.", variant: "destructive" });
      return;
    }
    setResumeGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Gera um resumo estruturado desta ata de condominio em portugues europeu. Inclui: pontos principais discutidos, decisoes tomadas, acoes a tomar e votacoes realizadas (se houver). Formato limpo e profissional.\n\nATA:\n" + content }],
          context: "",
        }),
      });
      const data = await res.json();
      if (data.content) {
        setContent(content + "\n\n---RESUMO AUTOMATICO (IA)---\n" + data.content);
        toast({ title: "Resumo gerado com sucesso!" });
      }
    } catch {
      toast({ title: "Erro ao gerar resumo.", variant: "destructive" });
    } finally {
      setResumeGenerating(false);
    }
  };

  const filtered = (documents || [])
    .filter((d: any) => filter === "todos" || d.category === filter)
    .filter((d: any) => !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase()));

  const stats = CATEGORIES.map(c => ({
    ...c,
    count: (documents || []).filter((d: any) => d.category === c.key).length
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Repositorio Documental
          </h1>
          <p className="text-muted-foreground mt-1">Regulamentos, atas e documentos oficiais do condominio.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Novo Documento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Publicar Novo Documento</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><label className="text-sm font-medium mb-1 block">Titulo</label><Input placeholder="Ex: Ata Assembleia Marco 2025" value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Categoria</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-sm font-medium mb-1 block">Versao</label><Input placeholder="Ex: 1.0" value={version} onChange={e => setVersion(e.target.value)} /></div>
                </div>
                <div><label className="text-sm font-medium mb-1 block">Descricao</label><Input placeholder="Breve descricao..." value={description} onChange={e => setDescription(e.target.value)} /></div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ficheiro (PDF, DOC)</label>
                  {fileName ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm text-emerald-700 flex-1 truncate">{fileName}</span>
                      <button onClick={() => { setFileUrl(null); setFileName(null); }} className="text-muted-foreground hover:text-rose-500 text-lg leading-none">x</button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">{uploading ? "A carregar..." : "Clique para fazer upload"}</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">Conteudo em texto</label>
                    {category === "ata" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={generateResume} disabled={resumeGenerating || !content.trim()}>
                        {resumeGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Gerar Resumo IA
                      </Button>
                    )}
                  </div>
                  <Textarea placeholder={category === "ata" ? "Escreva o conteudo da ata e depois clique em Gerar Resumo IA..." : "Conteudo do documento..."} value={content} onChange={e => setContent(e.target.value)} rows={8} />
                  {category === "ata" && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      Escreva o conteudo da ata e clique em "Gerar Resumo IA" para criar um resumo automatico com Groq.
                    </p>
                  )}
                </div>
                <Button className="w-full" disabled={!title || createDocument.isPending || uploading} onClick={() => createDocument.mutate({ title, description, category, fileUrl, content: content + (version ? "\n\nVersao: " + version : ""), createdBy: user?.id })}>
                  {createDocument.isPending ? "A publicar..." : "Publicar Documento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(s => (
          <Card key={s.key} className={"p-4 cursor-pointer border-l-4 " + s.border + (filter === s.key ? " ring-2 ring-primary" : "")} onClick={() => setFilter(filter === s.key ? "todos" : s.key)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <div className={"p-2 rounded-lg " + s.color}><s.icon className="w-4 h-4" /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar documentos..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === "todos" ? "default" : "outline"} size="sm" onClick={() => setFilter("todos")}>Todos ({(documents || []).length})</Button>
          {CATEGORIES.map(c => (
            <Button key={c.key} variant={filter === c.key ? "default" : "outline"} size="sm" onClick={() => setFilter(filter === c.key ? "todos" : c.key)}>
              <c.icon className="w-3.5 h-3.5 mr-1.5" />{c.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">{search ? "Nenhum documento encontrado." : "Sem documentos publicados."}</p>
          </Card>
        ) : filtered.map((doc: any, i: number) => {
          const cat = CATEGORIES.find(c => c.key === doc.category) || CATEGORIES[4];
          const author = users?.find(u => u.id === doc.createdBy);
          const isExpanded = expandedId === doc.id;
          const hasResume = doc.content?.includes("---RESUMO AUTOMATICO (IA)---");
          return (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={"border-l-4 " + cat.border + " hover:shadow-md transition-shadow"}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={"p-2.5 rounded-xl border flex-shrink-0 " + cat.color}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold">{doc.title}</h3>
                          <Badge className={"text-xs " + cat.color}>{cat.label}</Badge>
                          {hasResume && <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"><Sparkles className="w-3 h-3 mr-1" />Resumo IA</Badge>}
                        </div>
                        {doc.description && <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(doc.createdAt), "dd MMM yyyy", { locale: ptBR })}</span>
                          {author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{author.name}</span>}
                          {doc.fileUrl && <span className="flex items-center gap-1 text-emerald-600"><FileCheck className="w-3 h-3" />Ficheiro anexado</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="w-3 h-3 mr-1" />Download</Button>
                        </a>
                      )}
                      {doc.content && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setExpandedId(isExpanded ? null : doc.id)}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      )}
                      {isAdmin && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-700" onClick={() => deleteDocument.mutate(doc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && doc.content && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border/50">
                        {hasResume ? (
                          <div className="space-y-3">
                            <div className="bg-secondary/20 rounded-xl p-4 max-h-48 overflow-y-auto">
                              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Conteudo Original</p>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{doc.content.split("---RESUMO AUTOMATICO (IA)---")[0]}</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                              <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide flex items-center gap-1"><Sparkles className="w-3 h-3" />Resumo Automatico IA</p>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{doc.content.split("---RESUMO AUTOMATICO (IA)---")[1]}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-secondary/20 rounded-xl p-4 max-h-96 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{doc.content}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}