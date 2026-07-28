const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-16" role="status" aria-live="polite">
      <div className="relative">
        <div
          className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200"
          aria-hidden="true"
        ></div>
        <div
          className="absolute top-0 left-0 inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"
          aria-hidden="true"
          style={{ animationDuration: '1s' }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-6 text-lg font-semibold text-gray-700">{message}</p>
      <div className="mt-2 flex gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="sr-only">Cargando contenido</span>
    </div>
  );
};

export default LoadingSpinner;
