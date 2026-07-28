const TaxPayerInfo = ({ taxPayer }) => {
  if (!taxPayer) return null;

  return (
    <section className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl shadow-xl border-2 border-blue-100 p-8">
      <header className="flex items-center gap-4 mb-6">
        <div className="shrink-0">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg
              className="h-11 w-11 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">{taxPayer.name}</h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">Información del Contribuyente</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 mb-1">🏢 Identificación Fiscal</p>
              <p className="text-xl font-bold text-gray-900">
                {taxPayer.rncIdentification}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 mb-1">📊 Total de Comprobantes</p>
              <p className="text-xl font-bold text-gray-900">
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
