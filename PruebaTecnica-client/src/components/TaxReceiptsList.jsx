import { useEffect, useState, useCallback, } from "react";
import TaxReceiptCard from "./TaxReceiptCard";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";

const TaxReceiptsList = ({rncIdentification}) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10; // Constante fija
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });


  const fetchReceipts = useCallback(async () => {
    
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", pageSize);
      params.append("rncIdentification", rncIdentification);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/taxreceipts?${params.toString()}`,
      );

      if (response.status === 204) {
        setReceipts([]);
        setMeta({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          pageSize: 10,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
      
      setReceipts(items);
      setMeta({
        currentPage: data.currentPage || page,
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || items.length,
        pageSize: data.pageSize || 10,
      });
    } catch (err) {
      console.error("Error cargando comprobantes:", err);
      setError(err.message || "Error al cargar comprobantes fiscales");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, rncIdentification]);

  useEffect(() => {
    
    fetchReceipts();
  }, [fetchReceipts]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border-2 border-blue-100 p-12 shadow-xl">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" style={{ animationDuration: '1s' }}></div>
          </div>
          <p className="text-lg font-semibold text-gray-700">Cargando comprobantes fiscales...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </section>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <section className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border-2 border-dashed border-blue-200 p-16 text-center shadow-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">📋 No hay comprobantes fiscales</h3>
        <p className="text-gray-600">No se encontraron comprobantes fiscales para este contribuyente</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Comprobantes Fiscales
        </h2>
        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold text-sm">
          {meta.totalItems} comprobantes
        </span>
      </div>
      
      <div className="grid gap-4">
        {receipts.map((receipt, index) => (
          <TaxReceiptCard
            key={`${receipt.rncIdentification}-${receipt.ncf}-${index}`}
            receipt={receipt}
          />
        ))}
      </div>

      {/* Paginación */}
      {meta.totalPages > 1 && (
        <Pagination meta={meta} onPageChange={handlePageChange} />
      )}
    </section>
  );
};

export default TaxReceiptsList;
