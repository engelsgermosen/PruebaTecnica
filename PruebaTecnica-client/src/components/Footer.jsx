import { ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-slate-600">
            PruebaTecnica DGII{" "}
            <span className="text-slate-400">© {new Date().getFullYear()}</span>
          </p>
        </div>
        <p className="text-xs text-slate-500">Sistema de Gestión Tributaria</p>
      </div>
    </footer>
  );
};

export default Footer;
