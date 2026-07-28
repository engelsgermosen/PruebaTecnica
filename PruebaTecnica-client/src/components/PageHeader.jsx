const PageHeader = ({ title, description, onRefresh }) => {
  return (
    <header className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl shadow-xl border border-blue-100 p-8 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">{title}</h1>
          <p className="text-gray-600 text-lg">{description}</p>
        </div>
        {onRefresh && (
          <div>
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
              aria-label="Actualizar lista de contribuyentes"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualizar
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
