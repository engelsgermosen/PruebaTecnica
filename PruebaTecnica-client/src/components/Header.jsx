import { useContext, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
// Se importa el asset para que Vite lo emita con hash en el build de produccion.
// La ruta "/src/assets/..." solo existe en el servidor de desarrollo.
import logo from "../assets/Logo.png";
const Header = () => {
  const { user, logout } = useContext(AuthContext);

  const initials = useMemo(() => {
    const name = user?.fullName || user?.userName || "";
    const parts = String(name).trim().split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase() || "U";
  }, [user]);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-xl border-b-2  backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={"/"} className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity group">
          <img src={logo} alt="Logo" width={200}/>
        </Link>
    
        {user ? (
          <>
            <nav className="hidden md:block">
              <ul className="flex items-center gap-2">
                <li>
                  <NavLink
                    to="/auth/taxpayers"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`
                    }
                  >
                    Contribuyentes
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/auth/taxreceipts"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`
                    }
                  >
                    Comprobantes
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/auth/taxpayertypes"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`
                    }
                  >
                    Tipos
                  </NavLink>
                </li>
              </ul>
            </nav>
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-blue-50 border-blue-200 text-gray-900 hover:bg-blue-100 hover:border-blue-300 flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-semibold shadow-md">
                      {initials}
                    </span>
                    <span className="hidden sm:flex flex-col items-start leading-tight">
                      <span className="text-sm font-semibold text-gray-900">{user.fullName || user.userName}</span>
                      <span className="text-xs text-gray-600">{user.userName}</span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 shadow-2xl">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3 p-2">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate text-gray-900">{user.fullName || user.userName}</p>
                        {user.email && (
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-4 py-2 bg-gray-50 rounded-md mx-2 my-1">
                    <p className="text-xs text-gray-500">Usuario</p>
                    <p className="text-sm font-medium text-gray-900">{user.userName}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => { e.preventDefault(); logout(); }}
                    className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
