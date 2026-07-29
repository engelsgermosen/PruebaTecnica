import { FileText } from "lucide-react";
import TaxReceiptCard from "./TaxReceiptCard";

// Componente presentacional: renderiza los comprobantes que recibe por props del
// padre (TaxPayer.jsx). El padre ya trae el conjunto COMPLETO y no paginado desde
// /taxpayers/{rnc}/taxreceipts y calcula el "Total ITBIS Acumulado" sobre ese mismo
// arreglo, de modo que la lista y el total salen de una UNICA fuente y nunca divergen
// (antes este componente re-consultaba /taxreceipts con pageSize=10 mientras el total
// sumaba el set completo: con mas de 10 comprobantes mostraban datos distintos).
const TaxReceiptsList = ({ receipts = [], loading = false }) => {
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

  const items = Array.isArray(receipts) ? receipts : [];

  if (items.length === 0) {
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
          {items.length} comprobantes
        </span>
      </div>

      <div className="grid gap-4">
        {items.map((receipt, index) => (
          <TaxReceiptCard
            key={`${receipt.rncIdentification}-${receipt.ncf}-${index}`}
            receipt={receipt}
          />
        ))}
      </div>
    </section>
  );
};

export default TaxReceiptsList;
