const StatsFooter = ({ totalCount }) => {
  if (totalCount === 0) return null;

  return (
    <footer className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total de contribuyentes:{" "}
          <span
            className="font-medium text-gray-900"
            aria-label={`${totalCount} contribuyentes en total`}
          >
            {totalCount}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Última actualización:{" "}
          <time
            className="font-medium text-gray-900"
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
