import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ meta, onPageChange }) {
  const { currentPage, totalPages, totalItems, pageSize } = meta;

  // Calcular rango de items mostrados
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay 1 página
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mt-6">
      <div className="text-sm font-medium text-slate-600">
        Mostrando <span className="font-semibold text-slate-900">{startItem}</span> a{" "}
        <span className="font-semibold text-slate-900">{endItem}</span> de{" "}
        <span className="font-semibold text-slate-900">{totalItems}</span> resultados
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="rounded-lg border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
        >
          Primera
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <span className="text-sm font-semibold text-slate-700 px-4 py-2 bg-blue-50 rounded-lg">
          Página <span className="text-blue-600">{currentPage}</span> de{" "}
          <span className="text-blue-600">{totalPages}</span>
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="rounded-lg border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
        >
          Última
        </Button>
      </div>
    </div>
  );
}
