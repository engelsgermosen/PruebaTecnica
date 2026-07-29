import { useContext, useEffect, useState } from "react";
import Input from "../components/Input";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../middlewares/Auth";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isAuth = isAuthenticated();

  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!loginData.email || !loginData.password) {
      setError("Por favor, completa todos los campos.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (data.status === 401) {
        // Si la respuesta no es exitosa, mostrar el error
        setError(data.detail || "Credenciales incorrectas.");
        return;
      }

      login(data.user, data.accessToken, data.refreshToken);
      navigate("/auth/taxpayertypes");
    } catch (error) {
      setError(error?.data?.detail || "Error de conexión. Por favor, inténtalo de nuevo más tarde.");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  return (
    <div className="flex w-full items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header con Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-7 w-7" />
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Bienvenido
          </h1>
          <p className="text-sm text-slate-500">Inicia sesión para continuar</p>
        </div>

        {/* Card del formulario */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Error de autenticación</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
            name={"email"}
            label={"Email"}
            type={"email"}
            placeholder={"Ingresa tu email"}
            value={loginData.email}
            onChange={handleChange}
          />
          <Input
            name={"password"}
            label={"Contraseña"}
            type={"password"}
            placeholder={"Ingresa tu contraseña"}
            value={loginData.password}
            onChange={handleChange}
          />

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
            >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>

        {/* Footer del login */}
        <p className="text-center text-sm text-slate-500">
          Sistema de Gestión Tributaria DGII
        </p>
      </div>
    </div>
  );
};

export default Login;
