const StatsFooter = ({ totalCount }) => {
  if (totalCount === 0) return null;

  return (
    <footer className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Total de contribuyentes:{" "}
          <span
            className="font-semibold text-slate-900"
            aria-label={`${totalCount} contribuyentes en total`}
          >
            {totalCount}
          </span>
        </div>
        <div className="text-sm text-slate-600">
          Última actualización:{" "}
          <time
            className="font-semibold text-slate-900"
            dateTime={new Date().toISOString()}
          >
            {new Date().toLocaleDateString()}
          </time>
        </div>
      </div>
    </footer>
  );
};

export default StatsFooter;
