import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePayments, useReservations, useWorks, useSecurityLogs, useUsers } from "@/hooks/use-condominium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function SmartCondoChat() {
  const { user } = useAuth();
  const { data: payments } = usePayments();
  const { data: reservations } = useReservations();
  const { data: works } = useWorks();
  const { data: logs } = useSecurityLogs();
  const { data: users } = useUsers();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const buildContext = () => {
    const myPayments = payments?.filter(p => p.userId === user?.id) || [];
    const myReservations = reservations?.filter(r => r.userId === user?.id) || [];
    const pendingPayments = myPayments.filter(p => p.status === "pending");
    const activeWorks = works?.filter(w => w.status === "in_progress") || [];
    const openLogs = logs?.filter(l => l.status === "open") || [];

    return `
DADOS DO CONDOMINIO (atualizados em tempo real):
- Utilizador atual: ${user?.name}, fracao ${user?.unit}, tipo: ${user?.userType}
- Pagamentos pendentes do utilizador: ${pendingPayments.length} (total: EUR ${pendingPayments.reduce((a, p) => a + parseFloat(p.amount), 0).toFixed(2)})
- Reservas do utilizador: ${myReservations.length} no total
- Obras em curso no edificio: ${activeWorks.map(w => w.title).join(", ") || "nenhuma"}
- Ocorrencias abertas: ${openLogs.length}
- Total de condominios: ${users?.filter(u => u.userType === "condomino").length || 0}
    `.trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg, createdAt: new Date().toISOString() }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = `És o SmartCondo, um assistente especializado em gestão de condomínios portugueses.
És integrado na plataforma CondoManager e tens acesso aos dados reais do condomínio.

ESPECIALIDADES:
- Legislação portuguesa de condomínios (Lei 8/2022, Código Civil artigos 1414º-1438º-A, NRAU)
- Regulamento interno do condomínio
- Gestão de quotas e pagamentos
- Reservas de áreas comuns
- Obras e manutenção
- Segurança e ocorrências
- Direitos e obrigações de condóminos e arrendatários

${buildContext()}

REGRAS:
- Responde sempre em português europeu
- Sê preciso, útil e profissional
- Quando citares legislação, indica o artigo correto
- Se não souberes algo, diz claramente
- Mantém respostas concisas mas completas`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const assistantText = data.content?.[0]?.text || "Desculpe, ocorreu um erro. Tente novamente.";

      setMessages(prev => [...prev, { role: "assistant", content: assistantText, createdAt: new Date().toISOString() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Ocorreu um erro de ligacao. Verifique a sua conexao e tente novamente.", createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = [
    "Tenho pagamentos em atraso?",
    "Quais as regras para reservar a piscina?",
    "Que obras estao em curso?",
    "Quais os meus direitos como condominoo?",
  ];

  if (!user) return null;

  return (
    <>
      {/* Botao flutuante - canto inferior esquerdo */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={false}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center relative transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      </motion.div>

      {/* Janela de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-6 left-6 z-50 w-[min(400px,calc(100vw-2rem))] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-border/60 bg-background"
            style={{ height: "min(560px, calc(100vh - 5rem))" }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">SmartCondo IA</p>
                  <p className="text-xs text-white/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full inline-block animate-pulse" />
                    Especialista em condomínios portugueses
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm">
                      Ola, <strong>{user?.name?.split(" ")[0]}</strong>! Sou o <strong>SmartCondo IA</strong>, especialista em legislacao e gestao de condominios portugueses. Tenho acesso aos dados do seu condominio em tempo real. Como posso ajudar?
                    </div>
                  </div>
                  <div className="pl-11 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Sugestoes:
                    </p>
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="block w-full text-left text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 hover:bg-emerald-100 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-emerald-100 text-emerald-600"}`}>
                    {msg.role === "user" ? user?.name?.charAt(0) : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary/50 rounded-tl-sm"}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2 flex-shrink-0">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Escreva a sua pergunta..."
                disabled={loading}
                className="flex-1 rounded-xl"
              />
              <Button onClick={sendMessage} disabled={!input.trim() || loading} className="w-10 h-10 p-0 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}