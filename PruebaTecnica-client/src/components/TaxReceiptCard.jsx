const TaxReceiptCard = ({ receipt }) => {
  return (
    <article className="bg-gradient-to-br from-white via-blue-50/20 to-white border-2 border-blue-100 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:scale-[1.01] group">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
              📄 NCF: {receipt.ncf}
            </h3>
            <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5 mt-0.5">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              RNC: {receipt.rncIdentification}
            </p>
          </div>
        </div>
        <div className="px-3 py-2 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500 font-medium">
            🕒 {new Date(receipt.createdAt).toLocaleDateString('es-DO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monto */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/80 font-semibold mb-1">💰 Monto Base</p>
              <p className="text-xl font-bold text-white">
                {new Intl.NumberFormat("es-DO",{
                  style: "currency",
                  currency: "DOP"
                }).format(receipt.amount) || "0"}
              </p>
            </div>
          </div>
        </div>

        {/* ITBIS */}
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/80 font-semibold mb-1">🧾 ITBIS (18%)</p>
              <p className="text-xl font-bold text-white">
                {new Intl.NumberFormat("es-DO", {
                  style: "currency",
                  currency: "DOP"
                }).format(receipt.itbis18 || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-all duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/80 font-semibold mb-1">✅ Total Pagado</p>
              <p className="text-xl font-bold text-white">
                {new Intl.NumberFormat("es-DO", {
                  style: "currency",
                  currency: "DOP"
                }).format(
                  (receipt.amount || 0) + (receipt.itbis18 || 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TaxReceiptCard;
