import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Maximize2, Circle, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const cameras = [
  { id: 1, name: "Entrada Principal", location: "Hall de Entrada", status: "online", angle: "0°" },
  { id: 2, name: "Garagem", location: "Piso -1", status: "online", angle: "45°" },
  { id: 3, name: "Corredor Piso 1", location: "1º Andar", status: "online", angle: "90°" },
  { id: 4, name: "Jardim / Piscina", location: "Exterior", status: "online", angle: "120°" },
  { id: 5, name: "Elevador", location: "Todos os Pisos", status: "offline", angle: "0°" },
  { id: 6, name: "Saída de Emergência", location: "Piso 0", status: "online", angle: "180°" },
];

const NOISE_COLORS = [
  "from-slate-800 to-slate-900",
  "from-stone-800 to-zinc-900",
  "from-neutral-700 to-slate-800",
  "from-zinc-800 to-neutral-900",
  "from-gray-800 to-slate-900",
  "from-slate-700 to-gray-900",
];

export function UserCameras() {
  const [selected, setSelected] = useState<number | null>(null);
  const now = new Date();

  const selectedCam = cameras.find(c => c.id === selected);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Camera className="w-8 h-8 text-primary" />
            Câmeras de Segurança
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitorização em tempo real do edifício.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500" />
          <span>{cameras.filter(c => c.status === "online").length} câmeras ativas</span>
        </div>
      </div>

      {/* Câmera ampliada */}
      {selectedCam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <Card className="overflow-hidden border-2 border-primary/30 shadow-lg">
            <div className={`bg-gradient-to-br ${NOISE_COLORS[selectedCam.id - 1]} relative aspect-video flex items-center justify-center`}>
              <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")"}} />
              <div className="text-center text-white/30">
                <Camera className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sinal de vídeo ao vivo</p>
              </div>
              {/* HUD overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">{selectedCam.name}</span>
                <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-white" /> AO VIVO
                </span>
              </div>
              <div className="absolute bottom-3 left-3 text-white/70 text-xs font-mono">
                {format(now, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
              </div>
              <div className="absolute bottom-3 right-3 text-white/50 text-xs font-mono">
                CAM {String(selectedCam.id).padStart(2, "0")} | {selectedCam.angle}
              </div>
            </div>
            <div className="p-3 bg-secondary/30 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{selectedCam.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCam.location}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Fechar</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Grid de câmeras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map((cam, i) => (
          <motion.div
            key={cam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-md border ${selected === cam.id ? "border-primary ring-2 ring-primary/20" : "border-border/50"}`}
              onClick={() => cam.status === "online" ? setSelected(cam.id === selected ? null : cam.id) : null}
            >
              {/* Feed simulado */}
              <div className={`relative aspect-video flex items-center justify-center ${cam.status === "offline" ? "bg-gray-900" : `bg-gradient-to-br ${NOISE_COLORS[i]}`}`}>
                {cam.status === "offline" ? (
                  <div className="text-center text-white/40">
                    <WifiOff className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">Sem sinal</p>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")"}} />
                    <Camera className="w-8 h-8 text-white/20" />
                    {/* HUD */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="bg-rose-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Circle className="w-1.5 h-1.5 fill-white" /> AO VIVO
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white/50 text-xs font-mono">
                      CAM {String(cam.id).padStart(2, "0")}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4 text-white/70" />
                    </div>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex items-center justify-between bg-secondary/20">
                <div>
                  <p className="font-semibold text-sm">{cam.name}</p>
                  <p className="text-xs text-muted-foreground">{cam.location}</p>
                </div>
                <Badge
                  className={cam.status === "online"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"}
                >
                  <Circle className={`w-2 h-2 mr-1 ${cam.status === "online" ? "fill-emerald-500 text-emerald-500" : "fill-gray-400 text-gray-400"}`} />
                  {cam.status === "online" ? "Online" : "Offline"}
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
