import { Building2, Pencil, Trash2, Loader2 } from "lucide-react";

const TaxPayerTypeCard = ({
  taxPayerType,
  onEdit,
  onDelete,
  deleting = false,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 className="h-5 w-5" />
          </span>
          <h3 className="text-base font-semibold text-slate-900">
            {taxPayerType.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(taxPayerType)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
            aria-label={`Editar ${taxPayerType.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              onDelete(taxPayerType);
            }}
            disabled={deleting}
            className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:pointer-events-none disabled:opacity-50"
            aria-label={`Eliminar ${taxPayerType.name}`}
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
};

export default TaxPayerTypeCard;
