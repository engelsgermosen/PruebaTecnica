import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TaxPayerInfo from "../components/TaxPayerInfo";
import TaxReceiptsList from "../components/TaxReceiptsList";
import ItbisSummaryCard from "../components/ItbisSummaryCard";
import ErrorAlert from "../components/ErrorAlert";

const TaxPayer = () => {
  const { rncIdentification } = useParams();
  const [taxPayer, setTaxPayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTaxPayer = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/taxpayers/${rncIdentification}/taxreceipts`
        );

        if (!response.ok) {
          throw new Error("Error al cargar el contribuyente");
        }

        const data = await response.json();
        setTaxPayer(data);
      } catch (error) {
        console.error("Error fetching taxpayer:", error);
        setError(
          "Error al cargar la información del contribuyente. Por favor, inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    if (rncIdentification) {
      fetchTaxPayer();
    }
  }, [rncIdentification]);

  const calculateTotalItbis = () => {
    if (!taxPayer?.taxReceipts) return 0;
    return taxPayer.taxReceipts.reduce((total, receipt) => {
      return total + (receipt.itbis18 || 0);
    }, 0);
  };

  return (
    <div className="flex-1 w-full py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Navegación de vuelta */}
        <nav className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
        </nav>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 shadow-lg animate-slideInDown">
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-2 bg-red-100 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900 mb-1">⚠️ Error</h3>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border-2 border-blue-100 p-16 text-center shadow-xl">
            <div className="relative inline-block mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" style={{ animationDuration: '1s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              Cargando información del contribuyente...
            </p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : taxPayer ? (
          <div className="space-y-6">
            {/* Información del contribuyente */}
            <TaxPayerInfo taxPayer={taxPayer} />

            {/* Caja de resumen de ITBIS */}
            <ItbisSummaryCard
              totalItbis={calculateTotalItbis()}
              receiptCount={taxPayer.taxReceipts?.length || 0}
            />

            {/* Lista de comprobantes fiscales */}
            <TaxReceiptsList
              receipts={taxPayer.taxReceipts || []}
              loading={false}
              rncIdentification={rncIdentification}
            />
          </div>
        ) : (
          <div className="bg-linear-to-br from-white to-blue-50/30 rounded-2xl border-2 border-dashed border-blue-200 p-16 text-center shadow-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full mb-6 shadow-lg">
              <svg
                className="h-10 w-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              🔍 Contribuyente no encontrado
            </h3>
            <p className="text-gray-600 text-lg">
              No se pudo encontrar información para el RNC: <span className="font-semibold text-gray-900">{rncIdentification}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ← Regresar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxPayer;
