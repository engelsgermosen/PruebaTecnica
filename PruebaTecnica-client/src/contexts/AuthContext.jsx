import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getTokenExpiration, isTokenValid } from "../utils/jwt";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MAX_TIMEOUT = 2_147_483_647; // límite de setTimeout (~24.8 días)
const REFRESH_SKEW_MS = 15_000; // renovar 15s antes de expirar

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();
  const expiryTimer = useRef(null);

  const clearTimer = () => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = null;
    }
  };

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
  }, []);

  const persist = useCallback((userData, accessToken, newRefresh) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(newRefresh);
    if (userData) sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", accessToken);
    if (newRefresh) sessionStorage.setItem("refreshToken", newRefresh);
  }, []);

  const login = useCallback(
    (userData, accessToken, newRefresh) => {
      persist(userData, accessToken, newRefresh);
    },
    [persist]
  );

  const logout = useCallback(() => {
    clearTimer();
    clearSession();
    // El token expiró o el usuario cerró sesión → volver al home público.
    navigate("/");
  }, [clearSession, navigate]);

  // Renovación silenciosa con el refresh token. Devuelve true si tuvo éxito.
  const silentRefresh = useCallback(
    async (currentRefresh) => {
      const rt = currentRefresh ?? sessionStorage.getItem("refreshToken");
      if (!rt) return false;
      try {
        const { data } = await axios.post(`${BACKEND_URL}/auth/refresh`, {
          refresh: rt,
        });
        const newAccess = data?.accessToken;
        if (!newAccess) return false;
        const savedUser = sessionStorage.getItem("user");
        const newUser =
          data?.user ?? (savedUser ? JSON.parse(savedUser) : null);
        persist(newUser, newAccess, data?.refreshToken ?? rt);
        return true;
      } catch {
        return false;
      }
    },
    [persist]
  );

  // Restaurar sesión al montar.
  useEffect(() => {
    let active = true;
    const init = async () => {
      const savedUser = sessionStorage.getItem("user");
      const savedToken = sessionStorage.getItem("token");
      const savedRefresh = sessionStorage.getItem("refreshToken");

      if (savedToken && isTokenValid(savedToken) && savedUser) {
        if (!active) return;
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setRefreshToken(savedRefresh);
      } else if (savedRefresh) {
        // Access token vencido pero hay refresh token: intentar renovar.
        const ok = await silentRefresh(savedRefresh);
        if (!ok && active) clearSession();
      } else if (active) {
        clearSession();
      }
      if (active) setInitializing(false);
    };
    init();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expiración: al acercarse `exp`, renovar en silencio o cerrar sesión.
  useEffect(() => {
    clearTimer();
    if (!token) return;

    const expMs = getTokenExpiration(token);
    if (expMs === null) return;

    const delay = expMs - Date.now() - REFRESH_SKEW_MS;
    if (delay > MAX_TIMEOUT) return; // demasiado lejano; el interceptor lo cubrirá

    expiryTimer.current = setTimeout(async () => {
      const ok = await silentRefresh(refreshToken);
      if (!ok) logout(); // sin renovación posible → home público (/)
    }, Math.max(0, delay));

    return clearTimer;
  }, [token, refreshToken, silentRefresh, logout]);

  const authContextValue = {
    user,
    login,
    logout,
    token,
    refreshToken,
    isAuthenticated: isTokenValid(token),
    initializing,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
