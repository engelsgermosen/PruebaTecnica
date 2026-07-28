import { useEffect, useState, useCallback } from "react";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import TaxPayerList from "../components/TaxPayerList";
import StatsFooter from "../components/StatsFooter";
import Pagination from "../components/Pagination";
import { isAuthenticated } from "../middlewares/Auth";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";

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
        {/* Header simple y compacto */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contribuyentes</h1>
            <p className="text-sm text-gray-600 mt-1">Consulta de contribuyentes registrados</p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Búsqueda mejorada y simple */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Buscar por nombre o RNC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        {searchTerm && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <span><strong>{meta.totalItems}</strong> resultados encontrados</span>
          </div>
        )}

        {/* Lista de contribuyentes */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Cargando contribuyentes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        ) : taxPayers.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay contribuyentes'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay contribuyentes registrados'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {taxPayers.map((taxPayer) => (
              <a
                key={taxPayer.rncIdentification}
                href={`/taxpayer/${taxPayer.rncIdentification}`}
                className="block group"
              >
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {taxPayer.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                        {taxPayer.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        RNC: {taxPayer.rncIdentification}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Paginación simple */}
        {!loading && !error && taxPayers.length > 0 && meta.totalPages > 1 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{((meta.currentPage - 1) * meta.pageSize) + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(meta.currentPage * meta.pageSize, meta.totalItems)}</span> de <span className="font-semibold text-gray-900">{meta.totalItems}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(meta.currentPage - 1)}
                disabled={meta.currentPage === 1}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Anterior
              </button>
              <div className="flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-semibold text-blue-700">
                {meta.currentPage} / {meta.totalPages}
              </div>
              <button
                onClick={() => handlePageChange(meta.currentPage + 1)}
                disabled={meta.currentPage === meta.totalPages}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
