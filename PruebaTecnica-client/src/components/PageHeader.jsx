import { RefreshCw, LayoutDashboard } from "lucide-react";

const PageHeader = ({ title, description, onRefresh }) => {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
            aria-label="Actualizar lista de contribuyentes"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualizar
          </button>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
