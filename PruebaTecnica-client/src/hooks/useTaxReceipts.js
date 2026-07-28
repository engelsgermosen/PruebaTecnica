import { useEffect, useState, useCallback } from "react";
import { useApi } from "../lib/axiosClient";
import logger from '../utils/logger';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Hook para obtener comprobantes fiscales con paginación
 * @param {number} page - Número de página (inicia en 1)
 * @param {number} pageSize - Cantidad de items por página
 * @returns {Object} { data, loading, error, meta, refetch }
 */
export function useTaxReceipts(page = 1, pageSize = 5) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 1,
  });
  const api = useApi();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Construir URL con parámetros de paginación
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const response = await api.get(`/taxreceipts?${params.toString()}`);
      
      logger.info('Tax receipts fetched:', response.data);

      // El backend retorna un objeto PagedResponse con la estructura:
      // { currentPage, pageSize, totalItems, totalPages, items }
      const { items = [], currentPage, pageSize: size, totalItems, totalPages } = response.data;

      setData(items);
      setMeta({
        currentPage: currentPage || 1,
        pageSize: size || pageSize,
        totalItems: totalItems || 0,
        totalPages: totalPages || 1,
      });
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      logger.error('Error fetching tax receipts:', err);
      setError(errorMsg);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, meta, refetch: fetchData };
}
