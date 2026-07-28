const SearchBar = ({ searchTerm, onSearchChange, resultCount, totalCount }) => {
  return (
    <section className="bg-gradient-to-br from-white via-blue-50/20 to-white rounded-2xl shadow-lg border border-blue-100 p-6 backdrop-blur-sm">
      <div className="relative group">
        <label htmlFor="search-input" className="sr-only">
          Buscar contribuyentes
        </label>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-6 w-6 text-blue-500 group-focus-within:text-blue-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          id="search-input"
          type="search"
          className="block w-full pl-12 pr-4 py-4 border-2 text-gray-900 border-blue-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          placeholder="Buscar por nombre o RNC..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-describedby={searchTerm ? "search-results" : undefined}
        />
      </div>
      {searchTerm && (
        <div
          id="search-results"
          className="mt-3 text-sm font-medium text-blue-700 bg-blue-50 px-4 py-2 rounded-lg inline-block"
          role="status"
          aria-live="polite"
        >
          🔍 Mostrando <span className="font-bold">{resultCount}</span> de <span className="font-bold">{totalCount}</span> contribuyentes
        </div>
      )}
    </section>
  );
};

export default SearchBar;
