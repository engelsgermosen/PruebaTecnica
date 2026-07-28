import { useContext, useEffect, useState } from "react";
import Input from "../components/Input";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../middlewares/Auth";

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
            <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido
          </h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-red-500 mr-3 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed shadow-lg"
            >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>

        {/* Footer del login */}
        <p className="text-center text-sm text-gray-600">
          Sistema de Gestión Tributaria DGII
        </p>
      </div>
    </div>
  );
};

export default Login;
