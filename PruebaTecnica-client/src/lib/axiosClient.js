// api.ts / useApi.ts
import { useContext, useMemo, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "@/contexts/AuthContext";

const useApi = () => {
  const { token, logout, refreshToken, login, user } = useContext(AuthContext);

  // Instancia principal con interceptores (para uso normal)
  const api = useMemo(() => {
    return axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL,
    });
  }, []);

  // Instancia SIN interceptores (para /auth/refresh y reintentos)
  const bareClient = useMemo(() => {
    return axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL,
    });
  }, []);

  useEffect(() => {
    // ---------- REQUEST INTERCEPTOR ----------
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        config.headers = config.headers ?? {};

        // Para requests normales, siempre usa el token del contexto
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // ---------- RESPONSE INTERCEPTOR (REFRESH) ----------
    const resInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        const originalRequest = error.config;

        // Si no es 401 o no hay request original → dejar el error pasar
        if (status !== 401 || !originalRequest) {
          return Promise.reject(error);
        }

        // Evitar loop infinito
        if (originalRequest._retry) {
          logout();
          return Promise.reject(error);
        }
        originalRequest._retry = true;

        try {
          if (!refreshToken) {
            logout();
            return Promise.reject(error);
          }

          // 1️⃣ Pedimos nuevo access/refresh con un cliente sin interceptores
          const refreshResponse = await bareClient.post("/auth/refresh", {
            refresh: refreshToken,
          });

          const newAccessToken = refreshResponse.data.accessToken;
          const newRefreshToken = refreshResponse.data.refreshToken;
          const newUser = refreshResponse.data.user ?? user;

          if (!newAccessToken) {
            logout();
            return Promise.reject(error);
          }

          // 2️⃣ Actualizamos TODO el estado de auth
          //    (asumiendo que login(user, access, refresh) actualiza contexto + storage)
          login(newUser, newAccessToken, newRefreshToken ?? refreshToken);

          // 3️⃣ Forzamos el header Authorization en la request original
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 4️⃣ Reintentamos la MISMA petición,
          //     pero usando el cliente SIN interceptores para que
          //     el request-interceptor NO vuelva a meter el token viejo.
          return bareClient.request(originalRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }
    );

    // Cleanup
    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [api, bareClient, token, refreshToken, login, logout, user]);

  return api;
};

export { useApi };
export default useApi;
