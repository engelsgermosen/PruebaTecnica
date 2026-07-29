import { createPortal } from "react-dom";
import { PackageX, X } from "lucide-react";

const DeactivateProductModal = ({
  isOpen,
  product,
  onConfirm,
  onCancel,
  deleting = false,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="deactivate-modal-title"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 9999 }}
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={!deleting ? onCancel : undefined}
      ></div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <PackageX className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold text-slate-900" id="deactivate-modal-title">
              Desactivar producto
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <p className="text-sm text-slate-600">
            El producto{" "}
            <span className="font-semibold text-slate-900">"{product?.name}"</span>{" "}
            se marcará como <span className="font-semibold text-amber-700">inactivo</span>.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            No se elimina de la base de datos (soft delete). Dejará de aparecer al
            crear comprobantes, pero podrás reactivarlo editándolo y cambiando su
            estado a <span className="font-semibold">Activo</span>.
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-[2px] border-white/40 border-t-white" />
                Desactivando...
              </>
            ) : (
              "Desactivar"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeactivateProductModal;
