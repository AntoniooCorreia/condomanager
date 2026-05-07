import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUsers, useMessages, useSendMessage } from "@/hooks/use-condominium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronLeft, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

interface NotificationToast {
  id: number;
  senderName: string;
  content: string;
}

export function FloatingChat() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [lastSeenIds, setLastSeenIds] = useState<Set<number>>(new Set());
  const sendMessage = useSendMessage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    audioRef.current = new Audio("/sms_Sound.wav");
  }, []);

  const sistemaUser = users?.find(u => u.username === "sistema");

  const getContacts = useCallback(() => {
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
  }, [users, user]);

  const allContacts = sistemaUser
    ? [sistemaUser, ...getContacts().filter(c => c.id !== sistemaUser.id)]
    : getContacts();

  const filteredContacts = allContacts.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContact = users?.find(u => u.id === selectedUserId);

  const { data: messages } = useMessages(user?.id || 0, selectedUserId || 0);

  // Polling mensagens do sistema para notificacoes
  const { data: systemMessages } = useQuery({
    queryKey: ["/api/messages/sistema", user?.id, sistemaUser?.id],
    queryFn: async () => {
      if (!user?.id || !sistemaUser?.id) return [];
      const res = await fetch(`/api/messages?userId=${user.id}&otherUserId=${sistemaUser.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 3000,
    enabled: !!user?.id && !!sistemaUser?.id,
  });

  useEffect(() => {
    if (!systemMessages || !user) return;

    if (initialLoadRef.current) {
      const ids = new Set(systemMessages.map((m: any) => m.id));
      setLastSeenIds(ids);
      initialLoadRef.current = false;
      return;
    }

    const newMessages = systemMessages.filter((m: any) =>
      m.senderId !== user.id && !lastSeenIds.has(m.id)
    );

    if (newMessages.length > 0) {
      audioRef.current?.play().catch(() => {});

      newMessages.forEach((msg: any) => {
        const sender = users?.find(u => u.id === msg.senderId);
        const toast: NotificationToast = {
          id: msg.id,
          senderName: sender?.username === "sistema" ? "SmartCondo" : sender?.name || "Sistema",
          content: msg.content,
        };
        setNotifications(prev => [...prev, toast]);
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== toast.id));
        }, 5000);
      });

      setUnreadCount(prev => prev + newMessages.length);
      setLastSeenIds(prev => {
        const newSet = new Set(prev);
        newMessages.forEach((m: any) => newSet.add(m.id));
        return newSet;
      });
    }
  }, [systemMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

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
    <>
      {/* Notificacoes flutuantes */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-border shadow-2xl rounded-2xl p-4 max-w-sm pointer-events-auto"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  SC
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary">{notif.senderName}</p>
                  <p className="text-sm text-foreground mt-0.5 line-clamp-2">{notif.content}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
              <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  {selectedContact && (
                    <button onClick={() => setSelectedUserId(null)} className="hover:bg-white/20 rounded p-0.5">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <p className="font-bold text-sm">{selectedContact ? (selectedContact.username === "sistema" ? "SmartCondo" : selectedContact.name) : "Mensagens"}</p>
                    {selectedContact && (
                      <p className="text-xs text-primary-foreground/70">
                        {selectedContact.username === "sistema" ? "Assistente do Condominio" : selectedContact.userType === "gestor" ? "Administrador" : selectedContact.userType === "condomino" ? "Proprietario" : "Arrendatario"}
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
                    {filteredContacts.map(contact => (
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
                      <div className="text-center text-muted-foreground text-xs py-8">Sem mensagens.</div>
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
                      <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Mensagem..." className="flex-1 h-9 text-sm" />
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
    </>
  );
}