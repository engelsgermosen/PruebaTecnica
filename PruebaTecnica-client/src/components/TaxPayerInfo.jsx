import { User, Hash, Receipt } from "lucide-react";

const TaxPayerInfo = ({ taxPayer }) => {
  if (!taxPayer) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <User className="h-7 w-7" />
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">{taxPayer.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Información del Contribuyente</p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Hash className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-slate-500">Identificación Fiscal</p>
              <p className="text-xl font-semibold text-slate-900">
                {taxPayer.rncIdentification}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Receipt className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-slate-500">Total de Comprobantes</p>
              <p className="text-xl font-semibold text-slate-900">
                {taxPayer.taxReceipts?.length || 0} comprobantes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaxPayerInfo;
