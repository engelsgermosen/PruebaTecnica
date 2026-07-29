import { ReceiptText, Building2, Clock } from "lucide-react";
import { formatDOP } from "../utils/currency";

const TaxReceiptCard = ({ receipt }) => {
  const details = Array.isArray(receipt.details) ? receipt.details : [];
  const total =
    receipt.total != null
      ? receipt.total
      : (receipt.amount || 0) + (receipt.itbis18 || 0);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ReceiptText className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              NCF: {receipt.ncf}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <Building2 className="h-4 w-4 text-slate-400" />
              RNC: {receipt.rncIdentification}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {new Date(receipt.createdAt).toLocaleDateString("es-DO", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Detalle de líneas (snapshot histórico: nombre y precio guardados) */}
      {details.length > 0 && (
        <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5">Producto</th>
                <th className="px-4 py-2.5 text-right">P. Unitario</th>
                <th className="px-4 py-2.5 text-center">Cant.</th>
                <th className="px-4 py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {details.map((d) => (
                <tr key={d.id ?? `${d.productId}-${d.productName}`}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {d.productName}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                    {formatDOP(d.unitPrice)}
                  </td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">
                    {d.quantity}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                    {formatDOP(d.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Monto */}
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-sm font-medium text-slate-500">Monto Base</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {formatDOP(receipt.amount)}
          </p>
        </div>

        {/* ITBIS */}
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-sm font-medium text-slate-500">ITBIS (18%)</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {formatDOP(receipt.itbis18 || 0)}
          </p>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-sm font-medium text-slate-500">Total Pagado</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {formatDOP(total)}
          </p>
        </div>
      </div>
    </article>
  );
};

export default TaxReceiptCard;
