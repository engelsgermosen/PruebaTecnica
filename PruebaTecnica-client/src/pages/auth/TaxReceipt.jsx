import { ReceiptText } from "lucide-react";
import TaxReceiptList from "../../components/TaxReceiptList";

const TaxReceipt = () => {

  return (
    <div className="min-h-screen flex-1">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ReceiptText className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Gestión de Comprobantes Fiscales
              </h1>
              <p className="mt-1 text-sm text-slate-500">
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
