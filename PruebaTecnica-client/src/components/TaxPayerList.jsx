import TaxPayerCard from "./TaxPayerCard";
import ErrorAlert from "./ErrorAlert";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

const TaxPayerList = ({ taxPayers, loading, error, searchTerm }) => {
  return (
    <section
      className="bg-white rounded-lg shadow-sm border border-gray-200"
      aria-labelledby="taxpayer-list-heading"
    >
      <h2 id="taxpayer-list-heading" className="sr-only">
        Lista de contribuyentes
      </h2>

      <ErrorAlert message={error} />

      {loading ? (
        <LoadingSpinner message="Cargando contribuyentes..." />
      ) : taxPayers.length === 0 ? (
        <EmptyState searchTerm={searchTerm} />
      ) : (
        <div className="overflow-hidden">
          {/* Header de la tabla */}
          <header className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RNC/Identificación
              </div>
              <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre del Contribuyente
              </div>
            </div>
          </header>

          {/* Contenido de la tabla */}
          <div className="divide-y divide-gray-200" role="list">
            {taxPayers.map((taxPayer, index) => (
              <TaxPayerCard
                key={taxPayer.rncIdentification}
                taxPayer={taxPayer}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default TaxPayerList;
