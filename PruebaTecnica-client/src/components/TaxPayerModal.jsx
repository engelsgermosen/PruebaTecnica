import { createPortal } from "react-dom";
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-slideInUp border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
              {isEdit ? "Editar Contribuyente" : "Nuevo Contribuyente"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
            aria-label="Cerrar modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white rounded-b-2xl">
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
