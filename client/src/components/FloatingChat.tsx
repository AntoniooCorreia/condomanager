import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUsers, useMessages, useSendMessage } from "@/hooks/use-condominium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronLeft, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

export function FloatingChat() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const sendMessage = useSendMessage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sms_Sound.wav");
  }, []);

  const { data: messages } = useMessages(user?.id || 0, selectedUserId || 0);

  // Verificar mensagens nao lidas de todos os contactos
  const { data: allUsers } = useUsers();
  const contacts = allUsers?.filter(u => u.id !== user?.id) || [];

  // Polling para mensagens nao lidas
  const { data: unreadMessages } = useQuery({
    queryKey: ["/api/messages/unread", user?.id],
    queryFn: async () => {
      if (!user?.id || !sistemaUser?.id) return [];
      const res = await fetch(`/api/messages?userId=${user.id}&otherUserId=${sistemaUser.id}`);
      if (!res.ok) return [];
      const msgs = await res.json();
      return msgs.filter((m: any) => m.senderId !== user.id && !m.read);
    },
    refetchInterval: 3000,
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!unreadMessages) return;
    const count = unreadMessages.length || 0;
    if (count > lastMessageCount && lastMessageCount > 0) {
      audioRef.current?.play().catch(() => {});
    }
    setUnreadCount(count);
    setLastMessageCount(count);
  }, [unreadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

  const getContacts = () => {
    if (!users || !user) return [];
    if (user.role === "admin") return users.filter(u => u.id !== user.id && u.username !== "sistema");
    if (user.userType === "condomino") {
      const myTenants = users.filter(u => Number(u.relatedCondominoId) === user.id);
      const admins = users.filter(u => u.role === "admin" && u.username !== "sistema");
      const otherCondominos = users.filter(u => u.userType === "condomino" && u.id !== user.id);
      return [...admins, ...otherCondominos, ...myTenants];
    }
    if (user.userType === "arrendatario") {
      const myCondomino = users.filter(u => u.id === Number(user.relatedCondominoId));
      const admins = users.filter(u => u.role === "admin" && u.username !== "sistema");
      return [...admins, ...myCondomino];
    }
    return users.filter(u => u.role === "admin" && u.username !== "sistema");
  };

  // Adicionar SmartCondo aos contactos
  const sistemaUser = users?.find(u => u.username === "sistema");
  const allContacts = sistemaUser 
    ? [sistemaUser, ...getContacts().filter(c => c.id !== sistemaUser.id)]
    : getContacts();

  const filteredContacts = allContacts.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContact = users?.find(u => u.id === selectedUserId);

  const handleSend = () => {
    if (!input.trim() || !selectedUserId || !user) return;
    sendMessage.mutate({ senderId: user.id, receiverId: selectedUserId, content: input.trim() });
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 h-[480px] bg-background border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                {selectedContact && (
                  <button onClick={() => setSelectedUserId(null)} className="hover:bg-white/20 rounded p-0.5">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <p className="font-bold text-sm">{selectedContact ? selectedContact.name : "Mensagens"}</p>
                  {selectedContact && (
                    <p className="text-xs text-primary-foreground/70">
                      {selectedContact.username === "sistema" ? "SmartCondo" : selectedContact.userType === "gestor" ? "Administrador" : selectedContact.userType === "condomino" ? "Proprietario" : "Arrendatario"}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!selectedContact ? (
              <>
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Pesquisar..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">Sem contactos</div>
                  ) : filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedUserId(contact.id)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/30"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${contact.username === "sistema" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                        {contact.username === "sistema" ? "SC" : contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{contact.username === "sistema" ? "SmartCondo" : contact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.username === "sistema" ? "Assistente do Condominio" : contact.userType === "gestor" ? "Administrador" : contact.userType === "condomino" ? "Proprietario" : "Arrendatario"}
                          {contact.unit ? ` - ${contact.unit}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {!messages || messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-xs py-8">Sem mensagens. Comece a conversa!</div>
                  ) : messages.map((msg: any) => {
                    const isMine = msg.senderId === user?.id;
                    const isSystem = msg.senderId === sistemaUser?.id;
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isMine ? "bg-primary text-primary-foreground rounded-tr-sm" : isSystem ? "bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-tl-sm" : "bg-secondary rounded-tl-sm"}`}>
                          {isSystem && <p className="text-xs font-bold text-emerald-600 mb-1">SmartCondo</p>}
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-0.5 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                {selectedContact.username !== "sistema" && (
                  <div className="p-3 border-t flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Mensagem..."
                      className="flex-1 h-9 text-sm"
                    />
                    <Button onClick={handleSend} disabled={!input.trim() || sendMessage.isPending} className="w-9 h-9 p-0 flex-shrink-0">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botao flutuante com badge */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={unreadCount > 0 && !open ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: unreadCount > 0 ? Infinity : 0, duration: 1.5 }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {unreadCount > 0 && !open && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}