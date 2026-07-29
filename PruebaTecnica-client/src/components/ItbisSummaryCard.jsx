import { ReceiptText, Calculator } from "lucide-react";

const ItbisSummaryCard = ({ totalItbis, receiptCount }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Calculator className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Resumen de ITBIS</h2>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">Total de comprobantes</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{receiptCount}</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ReceiptText className="h-5 w-5" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">Total ITBIS Acumulado</p>
            <p className="mt-1 text-2xl font-semibold text-amber-700">
              {new Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP"
              }).format(totalItbis || 0)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Suma total de ITBIS de todos los comprobantes fiscales
            </p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Calculator className="h-5 w-5" />
          </span>
        </div>
      </div>
    </section>
  );
};

export default ItbisSummaryCard;
