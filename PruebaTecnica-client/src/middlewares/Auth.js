import { isTokenValid } from "../utils/jwt";

/**
 * Autenticado = existe un access token en sessionStorage y todavía no expiró.
 * Si el token está vencido se considera NO autenticado, de modo que los guards
 * redirijan al home público (`/`).
 */
export const isAuthenticated = () => {
  const token = sessionStorage.getItem("token");
  return isTokenValid(token);
};
