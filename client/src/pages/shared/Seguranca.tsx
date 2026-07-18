import { useSecurityLogs, useUsers, useUpdateSecurityLog, useCreateSecurityLog, useDeleteSecurityLog } from "@/hooks/use-condominium";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, Plus, CheckCircle2, ImageIcon, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSecurityLogSchema, type InsertSecurityLog } from "@/shared/schema";
import { z } from "zod";

const reportSchema = insertSecurityLogSchema.extend({
  description: z.string().trim().min(5, "Descreva a ocorrencia (minimo 5 caracteres)."),
});
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function Seguranca() {
  const { data: logs, isLoading } = useSecurityLogs();
  const { data: users } = useUsers();
  const { user } = useAuth();
  const createLog = useCreateSecurityLog();
  const updateLog = useUpdateSecurityLog();
  const deleteLog = useDeleteSecurityLog();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role === "admin";

  const filteredLogs = logs || [];

  const form = useForm<InsertSecurityLog>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reportedBy: user?.id, description: "", status: "open" },
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("security-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("security-images")
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
      setImagePreview(URL.createObjectURL(file));
      toast({ title: "Imagem carregada com sucesso." });
    } catch (err) {
      console.error("Upload error:", err); toast({ title: "Erro ao carregar imagem.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: InsertSecurityLog) => {
    createLog.mutate({ ...data, description: data.description.trim(), reportedBy: user?.id, imageUrl } as any, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Ocorrencia reportada." });
        setOpen(false);
        setImageUrl(null);
        setImagePreview(null);
        form.reset();
      },
      onError: (err: any) => toast({ title: "Erro", description: err?.message || "Nao foi possivel reportar a ocorrencia.", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Tem a certeza que quer apagar esta ocorrencia? Esta acao e irreversivel.")) return;
    deleteLog.mutate(id, {
      onSuccess: () => toast({ title: "Sucesso", description: "Ocorrencia apagada." }),
      onError: () => toast({ title: "Erro", description: "Nao foi possivel apagar.", variant: "destructive" }),
    });
  };

  const handleResolve = (id: number) => {
    updateLog.mutate({ id, status: "resolved" }, {
      onSuccess: () => toast({ title: "Sucesso", description: "Ocorrencia marcada como resolvida." }),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Ocorrencias
          </h1>
          <p className="text-muted-foreground mt-1">Registo de incidentes e alertas de seguranca.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 bg-rose-600 hover:bg-rose-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Reportar Ocorrencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reportar Nova Ocorrencia</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descricao do Incidente</FormLabel>
                    <FormControl><Textarea placeholder="Descreva o que aconteceu..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Upload de imagem */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Foto (opcional)</label>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => { setImageUrl(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-sm">{uploading ? "A carregar..." : "Clique para adicionar foto"}</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </div>

                <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white" disabled={createLog.isPending || uploading}>
                  {createLog.isPending ? "A enviar..." : "Enviar Alerta"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? <p>A carregar...</p> : filteredLogs?.length === 0 ? (
          <Card className="p-8 text-center border-border/50">
            <p className="text-muted-foreground font-medium">Nenhuma ocorrencia registada.</p>
          </Card>
        ) : filteredLogs?.map((log, i) => {
          const reporter = users?.find(u => u.id === log.reportedBy);
          const isOpen = log.status === "open";
          return (
            <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`p-5 flex flex-col md:flex-row gap-6 items-start md:items-center border-l-4 transition-all hover:shadow-md ${isOpen ? "border-l-rose-500 bg-rose-50/30" : "border-l-emerald-500"}`}>
                <div className={`p-3 rounded-full flex-shrink-0 ${isOpen ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {isOpen ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className={isOpen ? "text-rose-600 border-rose-200 bg-white" : "text-emerald-600 border-emerald-200 bg-white"}>
                      {isOpen ? "Em Aberto" : "Resolvido"}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-medium">
                      {format(new Date(log.date), "dd MMM yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-lg text-foreground font-medium">{log.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Reportado por: <span className="font-semibold">{reporter ? `Fracao ${reporter.unit} (${reporter.name})` : "Sistema"}</span>
                  </p>
                  {(log as any).imageUrl && (
                    <div className="mt-3">
                      <img
                        src={(log as any).imageUrl}
                        alt="Ocorrencia"
                        className="w-full max-w-sm h-40 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                        onClick={() => window.open((log as any).imageUrl, "_blank")}
                      />
                    </div>
                  )}
                </div>

                                {isAdmin && (
                  <div className="flex gap-2 shrink-0">
                    {isOpen && (
                      <Button
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleResolve(log.id)}
                        disabled={updateLog.isPending}
                      >
                        Marcar Resolvido
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(log.id)}
                      disabled={deleteLog.isPending}
                      title="Apagar ocorrencia"
                    >
                      <Trash2 className="w-4 h-4" />
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