import { useState } from "react";
import {
  Shield,
  Camera,
  AlertTriangle,
  CheckCircle,
  Radio,
  Maximize2,
  Grid3x3,
  List,
  Download,
  AlertCircle,
  Circle,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "warning";
  imageUrl: string;
  lastUpdate: string;
  recording: boolean;
}

const cameraFeeds: CameraFeed[] = [
  {
    id: "cam-01",
    name: "Câmera 01",
    location: "Entrada Principal",
    status: "online",
    imageUrl: "https://images.unsplash.com/photo-1760799264625-2abcfe55e59c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBidWlsZGluZyUyMGVudHJhbmNlfGVufDF8fHx8MTc3MTc4MzMwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    lastUpdate: "Há 2 segundos",
    recording: true,
  },
  {
    id: "cam-02",
    name: "Câmera 02",
    location: "Piscina",
    status: "online",
    imageUrl: "https://images.unsplash.com/photo-1725961503018-3b792b186815?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc3MTg3MDgxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    lastUpdate: "Há 1 segundo",
    recording: true,
  },
  {
    id: "cam-03",
    name: "Câmera 03",
    location: "Campo de Ténis",
    status: "online",
    imageUrl: "https://images.unsplash.com/photo-1764439063840-a03b75a477f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW5uaXMlMjBjb3VydCUyMG92ZXJoZWFkfGVufDF8fHx8MTc3MTg3MDgxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    lastUpdate: "Há 3 segundos",
    recording: true,
  },
  {
    id: "cam-04",
    name: "Câmera 04",
    location: "Estacionamento",
    status: "online",
    imageUrl: "https://images.unsplash.com/photo-1558798950-b05b143f435b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJraW5nJTIwbG90JTIwb3ZlcmhlYWQlMjB2aWV3fGVufDF8fHx8MTc3MTg3MDgxNnww&ixlib=rb-4.1.0&q=80&w=1080",
    lastUpdate: "Há 5 segundos",
    recording: true,
  },
  {
    id: "cam-05",
    name: "Câmera 05",
    location: "Corredor Principal",
    status: "online",
    imageUrl: "https://images.unsplash.com/photo-1760210211349-15b4ad2cf6c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWlsZGluZyUyMGNvcnJpZG9yJTIwaGFsbHdheXxlbnwxfHx8fDE3NzE4NzA4MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    lastUpdate: "Há 4 segundos",
    recording: true,
  },
  {
    id: "cam-06",
    name: "Câmera 06",
    location: "Área Comum - Jardim",
    status: "warning",
    imageUrl: "https://images.unsplash.com/photo-1651772672358-8382ca46ce39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMGNhbWVyYSUyMGNjdHYlMjBtb25pdG9yaW5nfGVufDF8fHx8MTc3MTg3MDgxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    lastUpdate: "Há 2 minutos",
    recording: false,
  },
];

interface SecurityEvent {
  id: string;
  type: "motion" | "alert" | "info";
  camera: string;
  message: string;
  timestamp: string;
}

const recentEvents: SecurityEvent[] = [
  {
    id: "1",
    type: "motion",
    camera: "Câmera 01",
    message: "Movimento detectado na entrada principal",
    timestamp: "23/02/2026 14:32",
  },
  {
    id: "2",
    type: "info",
    camera: "Câmera 02",
    message: "Sistema de gravação reiniciado",
    timestamp: "23/02/2026 13:15",
  },
  {
    id: "3",
    type: "motion",
    camera: "Câmera 04",
    message: "Veículo entrou no estacionamento",
    timestamp: "23/02/2026 12:45",
  },
  {
    id: "4",
    type: "alert",
    camera: "Câmera 06",
    message: "Qualidade de imagem degradada",
    timestamp: "23/02/2026 11:20",
  },
];

export function Seguranca() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getStatusBadge = (status: CameraFeed["status"]) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <Circle className="h-2 w-2 mr-1 fill-green-700" />
            Online
          </Badge>
        );
      case "offline":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <Circle className="h-2 w-2 mr-1 fill-red-700" />
            Offline
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Circle className="h-2 w-2 mr-1 fill-yellow-700" />
            Aviso
          </Badge>
        );
    }
  };

  const getEventIcon = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "motion":
        return <Radio className="h-4 w-4 text-blue-600" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const onlineCount = cameraFeeds.filter((c) => c.status === "online").length;
  const warningCount = cameraFeeds.filter((c) => c.status === "warning").length;
  const offlineCount = cameraFeeds.filter((c) => c.status === "offline").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Sistema de Segurança
          </h1>
          <p className="text-gray-600 mt-1">
            Monitorização em tempo real das câmeras do condomínio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
            size="sm"
            className={viewMode === "grid" ? "bg-blue-600" : ""}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
            className={viewMode === "list" ? "bg-blue-600" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Camera className="h-5 w-5" />
            <span className="text-sm font-medium">Total de Câmeras</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {cameraFeeds.length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Online</span>
          </div>
          <p className="text-2xl font-semibold text-green-900">{onlineCount}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Avisos</span>
          </div>
          <p className="text-2xl font-semibold text-yellow-900">
            {warningCount}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Offline</span>
          </div>
          <p className="text-2xl font-semibold text-red-900">{offlineCount}</p>
        </div>
      </div>

      <Tabs defaultValue="cameras" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cameras" className="gap-2">
            <Camera className="h-4 w-4" />
            Câmeras Ao Vivo
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Eventos Recentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cameras">
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameraFeeds.map((camera) => (
                <div
                  key={camera.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video bg-gray-900">
                    <ImageWithFallback
                      src={camera.imageUrl}
                      alt={camera.name}
                      className="w-full h-full object-cover"
                    />
                    {camera.recording && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        REC
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(camera.status)}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCamera(camera);
                        setIsFullscreen(true);
                      }}
                      className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-xs text-white/80">{camera.lastUpdate}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {camera.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      {camera.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Câmera
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Gravação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Última Atualização
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cameraFeeds.map((camera) => (
                    <tr key={camera.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900">
                            <ImageWithFallback
                              src={camera.imageUrl}
                              alt={camera.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-gray-900">
                            {camera.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {camera.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(camera.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {camera.recording ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                            <div className="w-2 h-2 bg-red-700 rounded-full mr-1 animate-pulse"></div>
                            Gravando
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                            Parado
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {camera.lastUpdate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCamera(camera);
                            setIsFullscreen(true);
                          }}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Eventos Recentes</h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
            <div className="divide-y divide-gray-200">
              {recentEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getEventIcon(event.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {event.camera}
                        </span>
                        <span className="text-xs text-gray-500">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-5xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5" />
                {selectedCamera?.name} - {selectedCamera?.location}
              </div>
              {selectedCamera && getStatusBadge(selectedCamera.status)}
            </DialogTitle>
          </DialogHeader>
          {selectedCamera && (
            <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={selectedCamera.imageUrl}
                alt={selectedCamera.name}
                className="w-full h-full object-contain"
              />
              {selectedCamera.recording && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  GRAVANDO
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded text-sm">
                {selectedCamera.lastUpdate}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
