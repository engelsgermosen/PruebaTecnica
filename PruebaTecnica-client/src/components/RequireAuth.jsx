import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Guard de rutas privadas. Mientras se restaura la sesión muestra un loader;
 * si no hay una sesión válida (token ausente o expirado) redirige al home
 * público (`/`).
 */
const RequireAuth = () => {
  const { isAuthenticated, initializing } = useContext(AuthContext);
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
