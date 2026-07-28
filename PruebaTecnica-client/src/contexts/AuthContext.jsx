import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    const savedToken = sessionStorage.getItem("token");
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (savedUser && savedToken && refreshToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setRefreshToken(refreshToken);
    }
  }, []);

  const login = (userData, token, refreshToken) => {
    setUser(userData);
    setToken(token);
    setRefreshToken(refreshToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("refreshToken", refreshToken);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    setRefreshToken(null);
    navigate("/");
    
  }, [navigate]);

  const authContextValue = {
    user,
    login,
    logout,
    token,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
