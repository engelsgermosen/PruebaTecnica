// Cálculo de montos de comprobantes.
//
// IMPORTANTE: la fuente de verdad de los montos es el servidor. Este cálculo es
// solo un PREVIEW en el cliente y debe coincidir EXACTAMENTE con el backend:
//   subtotal línea = round(cantidad * precioUnitario, 2)
//   base           = suma de subtotales de línea
//   itbis          = round(base * ITBIS_RATE, 2)
//   total          = base + itbis
// Se redondea por línea primero y luego se suma.

/** Tasa de ITBIS (18%). No usar el número mágico directamente. */
export const ITBIS_RATE = 0.18;

/** Redondeo a 2 decimales (evita errores de coma flotante). */
export const round2 = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/** Subtotal de una línea, redondeado a 2 decimales. */
export const lineSubtotal = (quantity, unitPrice) =>
  round2(Number(quantity) * Number(unitPrice));

/**
 * Calcula base (subtotal), ITBIS y total a partir de las líneas.
 * @param {Array<{quantity:number, unitPrice:number}>} lines
 * @returns {{ base:number, itbis:number, total:number }}
 */
export const computeReceiptTotals = (lines = []) => {
  const base = round2(
    lines.reduce((sum, line) => sum + lineSubtotal(line.quantity, line.unitPrice), 0)
  );
  const itbis = round2(base * ITBIS_RATE);
  const total = round2(base + itbis);
  return { base, itbis, total };
};
