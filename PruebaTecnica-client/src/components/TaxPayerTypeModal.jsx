import { createPortal } from "react-dom";
import { Tags, X } from "lucide-react";
import TaxPayerTypeForm from "./TaxPayerTypeForm";

const TaxPayerTypeModal = ({
  isOpen,
  taxPayerType,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 9999 }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={!loading ? onCancel : undefined}
      ></div>

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-lg animate-slideInUp">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Tags className="h-5 w-5" />
            </span>
            <div>
              <h3
                className="text-lg font-semibold text-slate-900"
                id="modal-title"
              >
                {isEditing
                  ? "Editar Tipo de Contribuyente"
                  : "Crear Nuevo Tipo de Contribuyente"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {isEditing
                  ? "Modifica la información del tipo de contribuyente"
                  : "Complete la información para crear un nuevo tipo de contribuyente"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={!loading ? onCancel : undefined}
            disabled={loading}
            className="shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <TaxPayerTypeForm
            taxPayerType={taxPayerType}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isEditing={isEditing}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TaxPayerTypeModal;
