import { createPortal } from "react-dom";
import { UserPlus, UserPen, X } from "lucide-react";
import TaxPayerForm from "./TaxPayerForm";

const TaxPayerModal = ({
  isOpen,
  onClose,
  onSubmit,
  taxPayer = null,
  loading = false,
  prefillRnc = "",
}) => {
  if (!isOpen) return null;

  const isEdit = taxPayer !== null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg animate-slideInUp">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {isEdit ? (
                <UserPen className="h-5 w-5" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              {isEdit ? "Editar Contribuyente" : "Nuevo Contribuyente"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <TaxPayerForm
            taxPayer={taxPayer}
            initialRnc={prefillRnc}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
            isEditing={isEdit}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaxPayerModal;
