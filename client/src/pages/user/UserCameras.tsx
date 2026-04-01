import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Maximize2, Circle, WifiOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const cameras = [
  {
    id: 1,
    name: "Entrada Principal",
    location: "Hall de Entrada",
    status: "online",
    videoId: "V3QMrftx3cQ",
  },
  {
    id: 2,
    name: "Garagem",
    location: "Piso -1",
    status: "online",
    videoId: "NziCFNjoD5Y",
  },
  {
    id: 3,
    name: "Corredor Piso 1",
    location: "1º Andar",
    status: "online",
    videoId: "gKs58hG2Akw",
  },
  {
    id: 4,
    name: "Jardim / Piscina",
    location: "Exterior",
    status: "online",
    videoId: "pVeDU5syCS4",
  },
  {
    id: 5,
    name: "Elevador",
    location: "Todos os Pisos",
    status: "online",
    videoId: "_rfLSVIA0L0",
  },
  {
    id: 6,
    name: "Saída de Emergência",
    location: "Piso 0",
    status: "online",
    videoId: "BJ9ng9L1CA0",
  },
];

function useTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function UserCameras() {
  const [selected, setSelected] = useState<number | null>(null);
  const now = useTime();

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

      {/* Modal câmera expandida */}
      <AnimatePresence>
        {selectedCam && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl"
              onClick={e => e.stopPropagation()}
            >
              <Card className="overflow-hidden border-2 border-primary/40 shadow-2xl bg-black">
                {/* HUD top bar */}
                <div className="bg-black/90 px-4 py-2 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                      <Circle className="w-2 h-2 fill-white" /> AO VIVO
                    </span>
                    <span className="text-white font-mono text-sm font-bold">{selectedCam.name}</span>
                    <span className="text-white/40 font-mono text-xs">{selectedCam.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/60 font-mono text-xs">
                      {format(now, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/10 h-7 w-7"
                      onClick={() => setSelected(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {/* Vídeo */}
                <div className="relative w-full aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedCam.videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedCam.name}
                  />
                  {/* CAM ID overlay */}
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <span className="bg-black/60 text-white/60 text-xs font-mono px-2 py-0.5 rounded">
                      CAM {String(selectedCam.id).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg border group ${
                selected === cam.id ? "border-primary ring-2 ring-primary/20" : "border-border/50"
              }`}
              onClick={() => cam.status === "online" ? setSelected(cam.id === selected ? null : cam.id) : null}
              data-testid={`card-camera-${cam.id}`}
            >
              {/* Feed de vídeo — thumbnail + hover */}
              <div className="relative aspect-video bg-black overflow-hidden">
                {cam.status === "offline" ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white/40">
                      <WifiOff className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Sem sinal</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Thumbnail do YouTube */}
                    <img
                      src={`https://img.youtube.com/vi/${cam.videoId}/mqdefault.jpg`}
                      alt={cam.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay escuro ao hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    {/* HUD badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="bg-rose-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-mono shadow">
                        <Circle className="w-1.5 h-1.5 fill-white" /> AO VIVO
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black/60 text-white/70 text-xs font-mono px-1.5 py-0.5 rounded">
                        CAM {String(cam.id).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="bg-black/60 text-white/50 text-xs font-mono px-1.5 py-0.5 rounded">
                        {format(now, "HH:mm:ss", { locale: ptBR })}
                      </span>
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
                  className={
                    cam.status === "online"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }
                >
                  <Circle
                    className={`w-2 h-2 mr-1 ${
                      cam.status === "online"
                        ? "fill-emerald-500 text-emerald-500"
                        : "fill-gray-400 text-gray-400"
                    }`}
                  />
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
