import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ConvData {
  conversationId: number;
  messages: Message[];
}

export function SmartCondoChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<ConvData>({
    queryKey: ["/api/smartcondo/conversation", user?.id],
    enabled: open && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/smartcondo/conversation?userId=${user?.id}`);
      if (!res.ok) throw new Error("Erro");
      return res.json();
    },
  });

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const sendMessage = async () => {
    if (!input.trim() || streaming || !data?.conversationId) return;

    const userMsg = input.trim();
    setInput("");

    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setStreaming(true);
    setStreamingText("");

    try {
      const response = await fetch("/api/smartcondo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: data.conversationId, message: userMsg, userId: user?.id }),
      });

      if (!response.body) throw new Error("No stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.content) {
              fullText += evt.content;
              setStreamingText(fullText);
            }
            if (evt.done) {
              const assistantMsg: Message = {
                id: Date.now() + 1,
                role: "assistant",
                content: fullText,
                createdAt: new Date().toISOString(),
              };
              setMessages(prev => [...prev, assistantMsg]);
              setStreamingText("");
              setStreaming(false);
              queryClient.invalidateQueries({ queryKey: ["/api/smartcondo/conversation"] });
            }
          } catch {}
        }
      }
    } catch {
      setStreaming(false);
      setStreamingText("");
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Posso reservar a piscina para daqui a 2 semanas?",
    "Tenho pagamentos em atraso?",
    "Que obras estão a decorrer?",
    "Como faço uma reserva do ginásio?",
  ];

  if (!user) return null;

  return (
    <>
      {/* Botão flutuante */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={false}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 relative"
          data-testid="button-smartcondo-open"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
        </Button>
      </motion.div>

      {/* Janela de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-2rem))] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-border/60"
            style={{ height: "min(600px, calc(100vh - 5rem))" }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">SmartCondo</p>
                  <p className="text-xs text-primary-foreground/70 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                    Assistente do Condomínio
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/20 h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 && !streaming ? (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                      <p className="text-sm">
                        Olá, <strong>{user?.name?.split(" ")[0]}</strong>! Sou o <strong>SmartCondo</strong>, o seu assistente inteligente.
                        Posso ajudá-lo com reservas, pagamentos, obras e muito mais. Como posso ajudar?
                      </p>
                    </div>
                  </div>
                  <div className="pl-11 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Sugestões:
                    </p>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="block w-full text-left text-xs text-primary bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 hover:bg-primary/10 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-secondary/50 rounded-tl-sm"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1.5 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Streaming */}
                  {streaming && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm">
                        {streamingText ? (
                          <p className="whitespace-pre-wrap">{streamingText}<span className="animate-pulse">▍</span></p>
                        ) : (
                          <div className="flex items-center gap-1.5 py-1">
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50 bg-background flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Escreva a sua pergunta..."
                  disabled={streaming || isLoading}
                  className="flex-1 rounded-xl border-border/60 focus:border-primary"
                  data-testid="input-smartcondo-message"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || streaming || isLoading}
                  className="rounded-xl w-10 h-10 p-0 flex-shrink-0"
                  data-testid="button-smartcondo-send"
                >
                  {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
