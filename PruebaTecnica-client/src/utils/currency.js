// Formato de moneda unificado para toda la app: pesos dominicanos (DOP).
const dopFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
});

/**
 * Formatea un valor numérico como moneda dominicana (RD$).
 * @param {number|string} value
 * @returns {string}
 */
export const formatDOP = (value) => dopFormatter.format(Number(value) || 0);

export default formatDOP;
