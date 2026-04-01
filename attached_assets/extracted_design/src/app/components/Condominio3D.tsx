import { useState } from "react";
import { Home, Waves, Activity, Camera, Maximize2, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

export function Condominio3D() {
  const [viewMode, setViewMode] = useState<"general" | "pool" | "tennis">("general");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.6));
  const handleRotate = () => setRotation((rotation + 45) % 360);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setViewMode("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "general"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Home className="h-4 w-4" />
          Vista Geral
        </button>
        <button
          onClick={() => setViewMode("pool")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "pool"
              ? "bg-cyan-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Waves className="h-4 w-4" />
          Piscina
        </button>
        <button
          onClick={() => setViewMode("tennis")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "tennis"
              ? "bg-green-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Activity className="h-4 w-4" />
          Campo de Ténis
        </button>
        
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all"
            title="Rodar Vista"
          >
            <RotateCw className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">4 Frações</h3>
          </div>
          <p className="text-sm text-blue-700">
            Casa 1A, 1B, 2A e 2B
          </p>
        </div>
        <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="h-5 w-5 text-cyan-600" />
            <h3 className="font-semibold text-cyan-900">Piscina</h3>
          </div>
          <p className="text-sm text-cyan-700">
            6m x 3m · Área comum
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Campo de Ténis</h3>
          </div>
          <p className="text-sm text-green-700">
            4m x 7m · Reserva obrigatória
          </p>
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[600px] w-full relative bg-gradient-to-b from-sky-100 to-green-50">
          <svg 
            viewBox="0 0 1000 800" 
            className="w-full h-full"
            style={{
              transform: `scale(${zoom}) rotateZ(${rotation}deg)`,
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            {/* Ground */}
            <rect x="0" y="0" width="1000" height="800" fill="#86efac" opacity="0.3" />
            
            {/* Grid lines */}
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={`grid-h-${i}`}
                x1="0"
                y1={i * 40}
                x2="1000"
                y2={i * 40}
                stroke="#000"
                strokeWidth="0.5"
                opacity="0.1"
              />
            ))}
            {Array.from({ length: 25 }).map((_, i) => (
              <line
                key={`grid-v-${i}`}
                x1={i * 40}
                y1="0"
                x2={i * 40}
                y2="800"
                stroke="#000"
                strokeWidth="0.5"
                opacity="0.1"
              />
            ))}

            {/* Houses */}
            {/* Casa 1A - Top Left */}
            <g transform="translate(150, 150)">
              <rect x="0" y="40" width="120" height="100" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
              <polygon points="60,0 0,40 120,40" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              <rect x="50" y="80" width="20" height="40" fill="#92400e" />
              <rect x="20" y="60" width="20" height="20" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              <rect x="80" y="60" width="20" height="20" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              <text x="60" y="160" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="bold">Casa 1A</text>
            </g>

            {/* Casa 1B - Top Right */}
            <g transform="translate(730, 150)">
              <rect x="0" y="40" width="120" height="100" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
              <polygon points="60,0 0,40 120,40" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              <rect x="50" y="80" width="20" height="40" fill="#92400e" />
              <rect x="20" y="60" width="20" height="20" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              <rect x="80" y="60" width="20" height="20" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              <text x="60" y="160" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="bold">Casa 1B</text>
            </g>

            {/* Casa 2A - Bottom Left */}
            <g transform="translate(150, 550)">
              <rect x="0" y="40" width="120" height="100" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
              <polygon points="60,0 0,40 120,40" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              <rect x="50" y="80" width="20" height="40" fill="#92400e" />
              <rect x="20" y="60" width="20" height="20" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              <rect x="80" y="60" width="20" height="20" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              <text x="60" y="160" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="bold">Casa 2A</text>
            </g>

            {/* Casa 2B - Bottom Right */}
            <g transform="translate(730, 550)">
              <rect x="0" y="40" width="120" height="100" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
              <polygon points="60,0 0,40 120,40" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              <rect x="50" y="80" width="20" height="40" fill="#92400e" />
              <rect x="20" y="60" width="20" height="20" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              <rect x="80" y="60" width="20" height="20" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              <text x="60" y="160" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="bold">Casa 2B</text>
            </g>

            {/* Pool - Center */}
            <g 
              transform="translate(400, 350)"
              className={viewMode === "pool" ? "opacity-100" : "opacity-70"}
              style={{ transition: 'opacity 0.3s' }}
            >
              <rect x="0" y="0" width="200" height="120" fill="#06b6d4" opacity="0.7" stroke="#0e7490" strokeWidth="3" />
              <rect x="-5" y="-5" width="210" height="130" fill="none" stroke="#94a3b8" strokeWidth="4" />
              <text x="100" y="70" textAnchor="middle" fill="#0e7490" fontSize="18" fontWeight="bold">PISCINA</text>
              <circle cx="30" cy="30" r="8" fill="#fef3c7" opacity="0.5" />
              <circle cx="170" cy="30" r="8" fill="#fef3c7" opacity="0.5" />
              <circle cx="30" cy="90" r="8" fill="#fef3c7" opacity="0.5" />
              <circle cx="170" cy="90" r="8" fill="#fef3c7" opacity="0.5" />
            </g>

            {/* Tennis Court */}
            <g 
              transform="translate(350, 50)"
              className={viewMode === "tennis" ? "opacity-100" : "opacity-70"}
              style={{ transition: 'opacity 0.3s' }}
            >
              <rect x="0" y="0" width="180" height="280" fill="#16a34a" stroke="#15803d" strokeWidth="3" />
              <line x1="0" y1="140" x2="180" y2="140" stroke="#fff" strokeWidth="3" />
              <line x1="90" y1="0" x2="90" y2="280" stroke="#fff" strokeWidth="2" />
              <rect x="20" y="40" width="140" height="200" fill="none" stroke="#fff" strokeWidth="2" />
              <line x1="40" y1="140" x2="140" y2="140" stroke="#fff" strokeWidth="4" strokeDasharray="5,5" />
              <text x="90" y="20" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">TÉNIS</text>
            </g>

            {/* Security Cameras */}
            <g className="cameras">
              {[
                { x: 150, y: 120, label: "Cam 1" },
                { x: 850, y: 120, label: "Cam 2" },
                { x: 150, y: 520, label: "Cam 3" },
                { x: 850, y: 520, label: "Cam 4" },
                { x: 500, y: 80, label: "Cam 5" },
                { x: 500, y: 700, label: "Cam 6" }
              ].map((cam, idx) => (
                <g key={idx} transform={`translate(${cam.x}, ${cam.y})`}>
                  <circle r="12" fill="#1f2937" />
                  <circle cx="3" cy="-3" r="3" fill="#ef4444" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text y="25" textAnchor="middle" fill="#1f2937" fontSize="10">{cam.label}</text>
                </g>
              ))}
            </g>

            {/* View mode highlights */}
            {viewMode === "pool" && (
              <circle cx="500" cy="410" r="180" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="10,5" opacity="0.5">
                <animate attributeName="r" values="180;190;180" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {viewMode === "tennis" && (
              <rect x="330" y="30" width="220" height="320" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="10,5" opacity="0.5">
                <animate attributeName="stroke-width" values="4;6;4" dur="2s" repeatCount="indefinite" />
              </rect>
            )}
          </svg>

          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-sm text-gray-600">
              🖱️ Use os botões acima para controlar a visualização
            </p>
          </div>

          {/* Camera status */}
          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <Camera className="h-4 w-4" />
              <span className="text-sm font-medium">6 Câmeras Ativas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Casas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-400 rounded"></div>
            <span className="text-sm text-gray-700">Piscina</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Campo de Ténis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
            <span className="text-sm text-gray-700">Câmeras</span>
          </div>
        </div>
      </div>
    </div>
  );
}
