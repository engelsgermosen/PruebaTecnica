import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, ReceiptText, Building2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "./Pagination";
import { useTaxReceipts } from "../hooks/useTaxReceipts";
import TaxReceiptModal from "./TaxReceiptModal";
import { Link } from "react-router-dom";

export default function TaxReceiptList({ showCreateButton = false, }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, loading, error, meta, refetch } = useTaxReceipts(page, pageSize);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTaxReceiptCreated = () => {
    refetch(); // Recargar la lista
    // if (onTaxReceiptCreated) {
    //   onTaxReceiptCreated(newTaxReceipt);
    // }
  };

  return (
    <Card className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ReceiptText className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Comprobantes Fiscales</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Total: {meta?.totalItems || 0} registros</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showCreateButton && (
              <TaxReceiptModal onTaxReceiptCreated={handleTaxReceiptCreated} />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="rounded-lg border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-xl border border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="font-medium text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-slate-100 text-slate-400 mb-4">
              <ReceiptText className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-slate-900">
              No hay comprobantes fiscales
            </p>
            <p className="mt-1 text-sm text-slate-500">
              No hay comprobantes fiscales registrados en el sistema.
            </p>
          </div>
        )}

        {/* Data list */}
        {!loading && !error && data.length > 0 && (
          <div className="space-y-4">
            {data.map((item) => (
              <Link
                to={`/taxpayer/${item.rncIdentification}`}
                key={item.id}
                className="block group"
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* Left section */}
                    <div className="flex items-start gap-4 flex-1">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                        <ReceiptText className="h-5 w-5" />
                      </span>

                      <div className="space-y-2 flex-1">
                        <p className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                          NCF: {item.ncf}
                        </p>
                        <p className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          RNC: {item.rncIdentification}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                          {/* Monto */}
                          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                            <p className="text-xs font-medium text-slate-500 mb-1">Monto</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {new Intl.NumberFormat("es-DO", {
                                style: "currency",
                                currency: "DOP"
                              }).format(item.amount)}
                            </p>
                          </div>

                          {/* ITBIS */}
                          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                            <p className="text-xs font-medium text-slate-500 mb-1">ITBIS</p>
                            <p className="text-lg font-semibold text-amber-600">
                              {new Intl.NumberFormat("es-DO", {
                                style: "currency",
                                currency: "DOP"
                              }).format(item.itbis18)}
                            </p>
                          </div>

                          {/* Total */}
                          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                            <p className="text-xs font-medium text-slate-500 mb-1">Total</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {new Intl.NumberFormat("es-DO", {
                                style: "currency",
                                currency: "DOP"
                              }).format(item.total != null ? item.total : item.amount + item.itbis18)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right section - Date */}
                    <div className="flex items-start justify-end flex-shrink-0">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-right">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-xs font-medium text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString('es-DO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            <div className="pt-4">
              <Pagination meta={meta} onPageChange={handlePageChange} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
