const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-16" role="status" aria-live="polite">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600"
        aria-hidden="true"
      ></div>
      <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>
      <span className="sr-only">Cargando contenido</span>
    </div>
  );
};

export default LoadingSpinner;
