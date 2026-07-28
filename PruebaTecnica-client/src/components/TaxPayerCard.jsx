import { Link } from "react-router-dom";

const TaxPayerCard = ({
  taxPayer,
  index,
  onEdit,
  onDelete,
  // onView,
  deleting = false,
  showActions = false,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case true:
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md";
      case false:
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (showActions) {
    // Versión para CRUD con botones de acción
    return (
      <article className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100 rounded-2xl p-5 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.01] group">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={`/taxpayer/${taxPayer.rncIdentification}`}
            className="flex-1 hover:opacity-80 transition-opacity"
            aria-label={`Ver detalles de ${taxPayer.name}`}
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg
                    className="h-8 w-8 text-white"
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
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {taxPayer.name}
                </h3>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 000 2h4a1 1 0 100-2H8z" />
                  </svg>
                  RNC: {taxPayer.rncIdentification}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(
                      taxPayer.status
                    )}`}
                  >
                    {taxPayer.status ? "✅ Activo" : "❌ Inactivo"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                    🏢 {taxPayer.taxPayerType?.name || taxPayer.type || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(taxPayer)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-blue-200 text-sm font-semibold rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
              aria-label={`Editar ${taxPayer.name}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={() => {
                onDelete(taxPayer);
              }}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-red-200 text-sm font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
              aria-label={`Eliminar ${taxPayer.name}`}
            >
              {deleting ? (
                <svg
                  className="animate-spin w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Versión original para listado simple con enlace
  return (
    <article
      className="bg-gradient-to-br from-white to-blue-50/20 border-2 border-blue-100 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.02] mb-3"
    >
      <Link
        to={`/taxpayer/${taxPayer.rncIdentification}`}
        className="block group"
        aria-label={`Ver detalles de ${taxPayer.name}`}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <div
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow"
              aria-hidden="true"
            >
              <svg
                className="h-9 w-9 text-white"
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
          </div>
          
          {/* Información */}
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
              {taxPayer.name}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mt-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 000 2h4a1 1 0 100-2H8z" />
              </svg>
              RNC: {taxPayer.rncIdentification}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              🔍 Click para ver detalles completos
            </div>
          </div>
          
          {/* Icono de flecha */}
          <div className="shrink-0">
            <svg className="w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default TaxPayerCard;
