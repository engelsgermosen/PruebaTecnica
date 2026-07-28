import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
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
    <Card className="w-full shadow-2xl border-2 border-blue-100 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">Comprobantes Fiscales</CardTitle>
              <p className="text-sm text-gray-600 mt-0.5">Total: {meta?.totalItems || 0} registros</p>
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
              className="hover:bg-blue-50 transition-colors border-blue-200"
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
          <Alert variant="destructive" className="mb-6 border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-2 border-blue-100 p-6 rounded-xl bg-gradient-to-br from-white to-blue-50/20 space-y-3">
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
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border-2 border-dashed border-blue-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              📋 No hay comprobantes fiscales
            </p>
            <p className="text-sm text-gray-600">
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
                <div className="bg-gradient-to-br from-white via-blue-50/20 to-white border-2 border-blue-100 p-6 rounded-xl hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* Left section */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <p className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors">
                          📄 NCF: {item.ncf}
                        </p>
                        <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                          RNC: {item.rncIdentification}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                          {/* Monto */}
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-3 shadow-md">
                            <p className="text-xs text-white/80 font-semibold mb-1">💰 Monto</p>
                            <p className="text-lg font-bold text-white">
                              {new Intl.NumberFormat("es-DO", {
                                style: "currency",
                                currency: "DOP"
                              }).format(item.amount)}
                            </p>
                          </div>
                          
                          {/* ITBIS */}
                          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-lg p-3 shadow-md">
                            <p className="text-xs text-white/80 font-semibold mb-1">🧾 ITBIS</p>
                            <p className="text-lg font-bold text-white">
                              {new Intl.NumberFormat("es-DO", {
                                style: "currency",
                                currency: "DOP"
                              }).format(item.itbis18)}
                            </p>
                          </div>
                          
                          {/* Total */}
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 shadow-md">
                            <p className="text-xs text-white/80 font-semibold mb-1">✅ Total</p>
                            <p className="text-lg font-bold text-white">
                              {new Intl.NumberFormat("es-DO", {
                                style: "currency",
                                currency: "DOP"
                              }).format(item.amount + item.itbis18)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right section - Date */}
                    <div className="flex items-start justify-end flex-shrink-0">
                      <div className="px-4 py-2 bg-gray-100 rounded-lg text-right">
                        <p className="text-xs text-gray-500 font-medium">
                          🕒 {new Date(item.createdAt).toLocaleDateString('es-DO', {
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
