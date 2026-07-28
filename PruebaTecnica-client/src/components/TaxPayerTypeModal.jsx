import { createPortal } from "react-dom";
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
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={!loading ? onCancel : undefined}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        ></div>

        {/* Modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="mb-4">
              <div className="flex items-center">
                <div className="shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    {isEditing
                      ? "Editar Tipo de Contribuyente"
                      : "Crear Nuevo Tipo de Contribuyente"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isEditing
                      ? "Modifica la información del tipo de contribuyente"
                      : "Complete la información para crear un nuevo tipo de contribuyente"}
                  </p>
                </div>
              </div>
            </div>

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
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TaxPayerTypeModal;
