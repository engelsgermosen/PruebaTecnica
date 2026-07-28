const Footer = () => {
  return (
    <footer className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 text-white border-t border-blue-700/50 shadow-2xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            <p className="text-sm font-medium text-blue-100">
              Pasantia DGII © {new Date().getFullYear()}
            </p>
          </div>
          <p className="text-xs text-blue-200">
            Sistema de Gestión Tributaria
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
