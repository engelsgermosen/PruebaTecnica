import TaxReceiptList from "../../components/TaxReceiptList";

const TaxReceipt = () => {

  return (
    <div className="min-h-screen flex-1">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header con gradiente */}
        <header className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📋 Gestión de Comprobantes Fiscales
              </h1>
              <p className="text-blue-100 text-base">
                Visualiza y administra todos los comprobantes fiscales registrados en el sistema.
              </p>
            </div>
          </div>
        </header>

        {/* Listado de comprobantes fiscales con botón crear */}
        <section>
          <TaxReceiptList showCreateButton={true} />
        </section>
      </div>
    </div>
  );
};

export default TaxReceipt;
