// Utilidades para decodificar y validar JSON Web Tokens en el cliente.
// Nota: la validez real del token la determina el backend; aquí solo leemos
// el claim `exp` para decidir si el access token ya expiró y evitar mostrar
// vistas privadas con un token vencido.

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * @param {string} token
 * @returns {Record<string, unknown> | null}
 */
export const decodeJwt = (token) => {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Devuelve el instante de expiración (ms epoch) o null si no existe.
 * @param {string} token
 * @returns {number | null}
 */
export const getTokenExpiration = (token) => {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
};

/**
 * Indica si el token está ausente o expirado.
 * @param {string} token
 * @param {number} [skewSeconds=15] margen de reloj en segundos
 * @returns {boolean}
 */
export const isTokenExpired = (token, skewSeconds = 15) => {
  const expMs = getTokenExpiration(token);
  if (expMs === null) return true; // sin exp legible → tratar como expirado
  return Date.now() >= expMs - skewSeconds * 1000;
};

/**
 * Indica si el token existe y aún no ha expirado.
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenValid = (token) => Boolean(token) && !isTokenExpired(token);
