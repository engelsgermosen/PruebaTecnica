const ItbisSummaryCard = ({ totalItbis, receiptCount }) => {
  return (
    <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl border-2 border-indigo-400/30 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Resumen de ITBIS</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-medium">📄 Total de comprobantes:</span>
            <span className="ml-auto text-xl font-bold bg-white/20 px-3 py-1 rounded-lg">{receiptCount}</span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 shadow-lg">
            <p className="text-white/80 text-sm font-medium mb-2">💰 Total ITBIS Acumulado</p>
            <div className="text-4xl font-bold">
              {new Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP"
              }).format(totalItbis || 0)}
            </div>
            <p className="text-white/70 text-sm mt-2">
              Suma total de ITBIS de todos los comprobantes fiscales
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItbisSummaryCard;
