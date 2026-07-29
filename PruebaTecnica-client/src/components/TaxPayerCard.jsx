import { Link } from "react-router-dom";
import { Building2, Pencil, Trash2, ChevronRight, Loader2 } from "lucide-react";

const TaxPayerCard = ({
  taxPayer,
  onEdit,
  onDelete,
  // onView,
  deleting = false,
  showActions = false,
}) => {
  const statusBadgeClass = (status) =>
    status
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
      : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20";

  const statusDotClass = (status) =>
    status ? "bg-emerald-500" : "bg-red-500";

  if (showActions) {
    // Versión para CRUD con botones de acción
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={`/taxpayer/${taxPayer.rncIdentification}`}
            className="flex-1 transition-opacity hover:opacity-80"
            aria-label={`Ver detalles de ${taxPayer.name}`}
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-slate-900">
                  {taxPayer.name}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  RNC: {taxPayer.rncIdentification}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                      taxPayer.status
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusDotClass(
                        taxPayer.status
                      )}`}
                    />
                    {taxPayer.status ? "Activo" : "Inactivo"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/15">
                    {taxPayer.taxPayerType?.name || taxPayer.type || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => onEdit(taxPayer)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 active:scale-[.98]"
              aria-label={`Editar ${taxPayer.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                onDelete(taxPayer);
              }}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
              aria-label={`Eliminar ${taxPayer.name}`}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Versión original para listado simple con enlace
  return (
    <article className="mb-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <Link
        to={`/taxpayer/${taxPayer.rncIdentification}`}
        className="group block"
        aria-label={`Ver detalles de ${taxPayer.name}`}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"
              aria-hidden="true"
            >
              <Building2 className="h-7 w-7" />
            </div>
          </div>

          {/* Información */}
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
              {taxPayer.name}
            </div>
            <div className="mt-0.5 text-sm text-slate-500">
              RNC: {taxPayer.rncIdentification}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Click para ver detalles completos
            </div>
          </div>

          {/* Icono de flecha */}
          <div className="shrink-0">
            <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
          </div>
        </div>
      </Link>
    </article>
  );
};

export default TaxPayerCard;
