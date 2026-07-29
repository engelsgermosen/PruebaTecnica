import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center px-4 flex-1">
      <div className="max-w-md w-full text-center">
        {/* Número 404 grande */}
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-slate-900">404</h1>
        </div>

        {/* Título y descripción */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            Página no encontrada
          </h2>
          <p className="text-slate-600 mb-2">
            La página que estás buscando no existe o ha sido movida.
          </p>
          <p className="text-sm text-slate-500">
            Puede que la URL esté mal escrita o que el contenido ya no esté
            disponible.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[.98]"
          >
            <Home className="h-4 w-4" />
            Ir al Inicio
          </button>

          <button
            onClick={handleGoBack}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 active:scale-[.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver Atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
