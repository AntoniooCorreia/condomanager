import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useAuth } from "../context/AuthContext";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  timestamp: Date;
  avatar?: string;
}

// Mock messages - in production this would come from real-time database
const initialMessages: ChatMessage[] = [
  {
    id: "1",
    userId: "2",
    userName: "Maria Santos",
    userRole: "condomino",
    message: "Bom dia! Alguém sabe se o elevador já foi reparado?",
    timestamp: new Date(2026, 1, 12, 9, 30),
  },
  {
    id: "2",
    userId: "3",
    userName: "Pedro Costa",
    userRole: "condomino",
    message: "Sim, foi reparado ontem à tarde. Já está a funcionar.",
    timestamp: new Date(2026, 1, 12, 9, 45),
  },
  {
    id: "3",
    userId: "4",
    userName: "Admin Condomínio",
    userRole: "owner",
    message:
      "Confirmamos que a manutenção do elevador foi concluída. Obrigado pela paciência!",
    timestamp: new Date(2026, 1, 12, 10, 0),
  },
  {
    id: "4",
    userId: "5",
    userName: "Carlos Oliveira",
    userRole: "condomino",
    message: "Excelente! E sobre a votação da pintura exterior?",
    timestamp: new Date(2026, 1, 12, 10, 15),
  },
  {
    id: "5",
    userId: "4",
    userName: "Admin Condomínio",
    userRole: "owner",
    message:
      "A votação está aberta até ao final da semana. Por favor votem na secção de Obras.",
    timestamp: new Date(2026, 1, 12, 10, 20),
  },
];

export function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate receiving messages in real-time
  useEffect(() => {
    if (!isOpen && messages.length > initialMessages.length) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.nome,
      userRole: currentUser.role,
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-700";
      case "condomino":
        return "bg-blue-100 text-blue-700";
      case "arrendatario":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Admin";
      case "condomino":
        return "Condómino";
      case "arrendatario":
        return "Arrendatário";
      default:
        return role;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all ${
        isMinimized
          ? "w-80 h-16"
          : "w-96 h-[600px] md:w-[400px] md:h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-lg">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Chat do Condomínio</h3>
            <div className="flex items-center gap-1 text-xs text-blue-100">
              <Users className="h-3 w-3" />
              <span>{messages.length} mensagens</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwnMessage = msg.userId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                            {msg.userName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {msg.userName}
                          </span>
                          <Badge
                            className={`${getRoleBadgeColor(
                              msg.userRole
                            )} text-xs px-2 py-0 hover:${getRoleBadgeColor(
                              msg.userRole
                            )}`}
                          >
                            {getRoleLabel(msg.userRole)}
                          </Badge>
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isOwnMessage
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${
                          isOwnMessage ? "text-right" : "text-left"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Escreva uma mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
