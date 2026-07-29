import { useEffect, useState, useCallback } from "react";
import { isAuthenticated } from "../middlewares/Auth";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import {
  RefreshCw,
  Search,
  X,
  AlertCircle,
  Building2,
  ChevronRight,
  Hash,
} from "lucide-react";

const Home = () => {
  const [taxPayers, setTaxPayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const navigate = useNavigate();
  const isAuth = isAuthenticated();

  // Debounce del término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchTaxPayers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Construir URL con parámetros
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", meta.pageSize);

      if (debouncedSearchTerm.trim()) {
        params.append("rncIdentification", debouncedSearchTerm.trim());
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/taxpayers?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Error al cargar los contribuyentes");
      }

      if (response.status === 204) {
        setTaxPayers([]);
        setMeta({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          pageSize: 10,
        });
        return;
      }

      const data = await response.json();
      setTaxPayers(data.items || []);
      setMeta({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        pageSize: data.pageSize,
      });
    } catch (error) {
      console.error("Error fetching tax payers:", error);
      setError(
        "Error al cargar los contribuyentes. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, [page, meta.pageSize, debouncedSearchTerm]);

  useEffect(() => {
    fetchTaxPayers();
  }, [fetchTaxPayers]);

  // Resetear a página 1 cuando cambia el término de búsqueda
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const handleRefresh = () => {
    fetchTaxPayers();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (isAuth) {
      navigate("/auth/dashboard");
    }
  }, [isAuth, navigate]);

  return (
    <div className="flex-1 w-full">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Contribuyentes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Consulta de contribuyentes registrados
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 active:scale-[.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Buscar por nombre o RNC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-11 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                onClick={() => setSearchTerm("")}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        {searchTerm && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Search className="h-4 w-4 text-blue-600" />
            <span>
              <strong className="font-semibold text-slate-900">
                {meta.totalItems}
              </strong>{" "}
              resultados encontrados
            </span>
          </div>
        )}

        {/* Lista de contribuyentes */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600"></div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              Cargando contribuyentes...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        ) : taxPayers.length === 0 ? (
          <div className="py-12 text-center sm:py-16">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Building2 className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {searchTerm
                ? "No se encontraron resultados"
                : "No hay contribuyentes"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "No hay contribuyentes registrados"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {taxPayers.map((taxPayer) => (
              <a
                key={taxPayer.rncIdentification}
                href={`/taxpayer/${taxPayer.rncIdentification}`}
                className="group block"
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white">
                        {taxPayer.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                        {taxPayer.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                        <Hash className="h-4 w-4 text-slate-400" />
                        RNC: {taxPayer.rncIdentification}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-blue-600" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && !error && taxPayers.length > 0 && meta.totalPages > 1 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-slate-600">
              Mostrando{" "}
              <span className="font-semibold text-slate-900">
                {(meta.currentPage - 1) * meta.pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(meta.currentPage * meta.pageSize, meta.totalItems)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-900">
                {meta.totalItems}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(meta.currentPage - 1)}
                disabled={meta.currentPage === 1}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50"
              >
                Anterior
              </button>
              <div className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/20">
                {meta.currentPage} / {meta.totalPages}
              </div>
              <button
                onClick={() => handlePageChange(meta.currentPage + 1)}
                disabled={meta.currentPage === meta.totalPages}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
