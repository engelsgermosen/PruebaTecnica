import { useState, useEffect } from 'react';

/**
 * Hook para hacer debounce de un valor
 * Útil para búsquedas en tiempo real - espera a que el usuario deje de escribir
 * @param {*} value - Valor a hacer debounce
 * @param {number} delay - Delay en milisegundos (default: 500ms)
 * @returns {*} Valor con debounce aplicado
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
