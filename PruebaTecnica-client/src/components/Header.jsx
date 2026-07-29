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
import { LayoutDashboard, Users, ReceiptText, Tags, LogOut } from "lucide-react";
// Se importa el asset para que Vite lo emita con hash en el build de produccion.
// La ruta "/src/assets/..." solo existe en el servidor de desarrollo.
import logo from "../assets/Logo.png";

const navItems = [
  { to: "/auth/dashboard", label: "Panel", icon: LayoutDashboard },
  { to: "/auth/taxpayers", label: "Contribuyentes", icon: Users },
  { to: "/auth/taxreceipts", label: "Comprobantes", icon: ReceiptText },
  { to: "/auth/taxpayertypes", label: "Tipos", icon: Tags },
];

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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="Ir al inicio"
        >
          <img src={logo} alt="PruebaTecnica DGII" className="h-9 w-auto" />
        </Link>

        {user ? (
          <>
            <nav className="hidden md:block">
              <ul className="flex items-center gap-1">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-auto items-center gap-2.5 border-slate-200 py-1.5 pl-1.5 pr-3 text-slate-900 hover:bg-slate-50"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white">
                    {initials}
                  </span>
                  <span className="hidden flex-col items-start leading-tight sm:flex">
                    <span className="text-sm font-semibold text-slate-900">
                      {user.fullName || user.userName}
                    </span>
                    <span className="text-xs text-slate-500">{user.userName}</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-base font-semibold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.fullName || user.userName}
                      </p>
                      {user.email && (
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <p className="text-xs text-slate-500">Usuario</p>
                  <p className="text-sm font-medium text-slate-900">
                    {user.userName}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                  className="cursor-pointer font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
