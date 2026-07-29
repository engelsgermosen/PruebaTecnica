import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, UserX } from "lucide-react";
import TaxPayerInfo from "../components/TaxPayerInfo";
import TaxReceiptsList from "../components/TaxReceiptsList";
import ItbisSummaryCard from "../components/ItbisSummaryCard";

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
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        </nav>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600"></div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              Cargando información del contribuyente...
            </p>
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
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:py-16">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <UserX className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Contribuyente no encontrado
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              No se pudo encontrar información para el RNC:{" "}
              <span className="font-medium text-slate-900">
                {rncIdentification}
              </span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxPayer;
