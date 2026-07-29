import { useEffect, useState, useCallback, } from "react";
import { AlertCircle, FileText } from "lucide-react";
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
      <section className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">Cargando comprobantes fiscales...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </section>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm sm:py-16">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FileText className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-slate-900">No hay comprobantes fiscales</h3>
        <p className="mt-1 text-sm text-slate-500">No se encontraron comprobantes fiscales para este contribuyente</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" />
          </span>
          Comprobantes Fiscales
        </h2>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
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
