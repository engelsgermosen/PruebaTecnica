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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-white via-blue-50/20 to-white rounded-2xl shadow-lg border border-blue-100 p-6 mt-6">
      <div className="text-sm font-medium text-gray-700">
        Mostrando <span className="font-bold text-blue-700">{startItem}</span> a{" "}
        <span className="font-bold text-blue-700">{endItem}</span> de{" "}
        <span className="font-bold text-blue-700">{totalItems}</span> resultados
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 font-semibold"
        >
          Primera
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 font-semibold"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <span className="text-sm font-semibold text-gray-900 px-4 py-2 bg-blue-100 rounded-lg">
          Página <span className="text-blue-700">{currentPage}</span> de{" "}
          <span className="text-blue-700">{totalPages}</span>
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 font-semibold"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 font-semibold"
        >
          Última
        </Button>
      </div>
    </div>
  );
}
