import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, Download, Upload, BookOpen, FileCheck, File } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { key: "regulamento", label: "Regulamento", icon: BookOpen, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "ata", label: "Ata de Reuniao", icon: FileCheck, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "seguro", label: "Seguro", icon: FileText, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "contrato", label: "Contrato", icon: File, color: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "geral", label: "Geral", icon: FileText, color: "bg-secondary text-foreground border-border" },
];

export function Documentos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("geral");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("todos");
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
      await apiRequest("DELETE", `/api/documents?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Documento removido." });
    },
  });

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategory("geral");
    setContent(""); setFileUrl(null); setFileName(null);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const name = `${Date.now()}.${ext}`;
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

  const filtered = filter === "todos" ? documents : documents?.filter((d: any) => d.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Documentos
          </h1>
          <p className="text-muted-foreground mt-1">Regulamentos, atas e documentos oficiais do condominio.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Novo Documento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Publicar Novo Documento</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><label className="text-sm font-medium mb-1 block">Titulo</label><Input placeholder="Ex: Regulamento Interno 2024" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><label className="text-sm font-medium mb-1 block">Categoria</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><label className="text-sm font-medium mb-1 block">Descricao (opcional)</label><Input placeholder="Breve descricao..." value={description} onChange={(e) => setDescription(e.target.value)} /></div>

                {/* Upload PDF */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Ficheiro PDF (opcional)</label>
                  {fileName ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 flex-1 truncate">{fileName}</span>
                      <button onClick={() => { setFileUrl(null); setFileName(null); }} className="text-muted-foreground hover:text-rose-500">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">{uploading ? "A carregar..." : "Clique para fazer upload de PDF"}</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                </div>

                {/* Conteudo texto */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Conteudo em texto (opcional)</label>
                  <Textarea placeholder="Pode escrever o conteudo do documento aqui..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
                </div>

                <Button className="w-full" disabled={!title || createDocument.isPending || uploading} onClick={() => createDocument.mutate({ title, description, category, fileUrl, content, createdBy: user?.id })}>
                  {createDocument.isPending ? "A publicar..." : "Publicar Documento"}
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

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : !filtered || filtered.length === 0 ? (
          <Card className="col-span-full p-12 text-center border-dashed">
            <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Sem documentos publicados.</p>
          </Card>
        ) : filtered.map((doc: any, i: number) => {
          const cat = CATEGORIES.find(c => c.key === doc.category) || CATEGORIES[4];
          return (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 hover:shadow-md transition-shadow border-border/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${cat.color}`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">{doc.title}</h3>
                        <Badge className={`text-xs flex-shrink-0 ${cat.color}`}>{cat.label}</Badge>
                      </div>
                      {doc.description && <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>}
                      {doc.content && (
                        <div className="bg-secondary/30 rounded-lg p-3 mt-2 max-h-32 overflow-y-auto">
                          <p className="text-sm whitespace-pre-wrap">{doc.content}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <p className="text-xs text-muted-foreground">{format(new Date(doc.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              <Download className="w-3 h-3 mr-1" /> Download
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-700 flex-shrink-0" onClick={() => deleteDocument.mutate(doc.id)}>
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