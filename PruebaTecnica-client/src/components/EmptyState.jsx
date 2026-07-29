import { Search, FolderOpen } from "lucide-react";

const EmptyState = ({ searchTerm, title }) => {
  const isSearchResult = Boolean(searchTerm);
  const Icon = isSearchResult ? Search : FolderOpen;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 sm:py-16 shadow-sm my-8">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {title
          ? title
          : isSearchResult
          ? "No se encontraron contribuyentes"
          : "No hay contribuyentes disponibles"}
      </h3>
      <p className="mt-1 max-w-md text-center text-sm text-slate-500">
        {isSearchResult
          ? "Intenta con otros términos de búsqueda o verifica que la información sea correcta."
          : "Aún no hay contribuyentes registrados en el sistema."}
      </p>
      {searchTerm && (
        <div className="mt-4 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
          Búsqueda: "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default EmptyState;
