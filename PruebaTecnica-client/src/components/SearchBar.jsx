import { Search } from "lucide-react";

const SearchBar = ({ searchTerm, onSearchChange, resultCount, totalCount }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative">
        <label htmlFor="search-input" className="sr-only">
          Buscar contribuyentes
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <input
          id="search-input"
          type="search"
          className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          placeholder="Buscar por nombre o RNC..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-describedby={searchTerm ? "search-results" : undefined}
        />
      </div>
      {searchTerm && (
        <div
          id="search-results"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
          role="status"
          aria-live="polite"
        >
          Mostrando <span className="font-semibold">{resultCount}</span> de{" "}
          <span className="font-semibold">{totalCount}</span> contribuyentes
        </div>
      )}
    </section>
  );
};

export default SearchBar;
