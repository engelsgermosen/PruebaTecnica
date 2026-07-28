const EmptyState = ({ searchTerm, title }) => {
  const isSearchResult = Boolean(searchTerm);

  return (
    <div className="flex flex-col items-center justify-center p-16 bg-linear-to-br from-white to-blue-50/30 rounded-2xl border-2 border-dashed border-blue-200 my-8">
      <div className="p-6 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full mb-6 shadow-lg">
        <svg
          className="h-16 w-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isSearchResult ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          )}
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {title ? title : isSearchResult  
          ? "🔍 No se encontraron contribuyentes"
          : "📁 No hay contribuyentes disponibles"}
      </h3>
      <p className="text-gray-600 text-center max-w-md text-lg">
        {isSearchResult
          ? "Intenta con otros términos de búsqueda o verifica que la información sea correcta."
          : "Aún no hay contribuyentes registrados en el sistema."}
      </p>
      {searchTerm && (
        <div className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
          Búsqueda: "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default EmptyState;
