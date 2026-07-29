import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-6 border-b border-slate-200" role="alert">
      <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        <span className="text-sm text-red-700">{message}</span>
      </div>
    </div>
  );
};

export default ErrorAlert;
