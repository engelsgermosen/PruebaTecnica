import { Pencil, PackageX, Loader2 } from "lucide-react";
import { formatDOP } from "../utils/currency";

const StatusBadge = ({ isActive }) =>
  isActive ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Inactivo
    </span>
  );

const ProductTable = ({ products = [], onEdit, onDeactivate, deletingId = null }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Descripción</th>
            <th className="px-4 py-3 text-right">Precio unitario</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {products.map((product) => {
            const isDeleting = deletingId === product.id;
            return (
              <tr
                key={product.id}
                className="text-sm transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {product.name}
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-600">
                  <span className="line-clamp-2">
                    {product.description || (
                      <span className="text-slate-400">—</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                  {formatDOP(product.unitPrice)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge isActive={product.isActive} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      title="Editar"
                      aria-label={`Editar ${product.name}`}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {product.isActive && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(product)}
                        disabled={isDeleting}
                        title="Desactivar (soft delete)"
                        aria-label={`Desactivar ${product.name}`}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <PackageX className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
