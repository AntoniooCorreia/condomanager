import { Condominio3D } from "../components/Condominio3D";
import { Box, Info } from "lucide-react";

export function Visao3D() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
          <Box className="h-8 w-8 text-blue-600" />
          Visão 3D do Condomínio
        </h1>
        <p className="text-gray-600 mt-1">
          Visualização interativa do espaço do condomínio
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Como usar a visualização 3D
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Rodar:</strong> Clique e arraste com o botão esquerdo do rato</li>
              <li>• <strong>Zoom:</strong> Use a roda do rato para aproximar ou afastar</li>
              <li>• <strong>Mover:</strong> Clique e arraste com o botão direito do rato</li>
              <li>• <strong>Vistas rápidas:</strong> Use os botões acima para alternar entre diferentes perspetivas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3D View */}
      <Condominio3D />
    </div>
  );
}
