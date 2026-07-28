const TaxRecipts = ({ receipt }) => {
  return (
    <div
      key={receipt.id}
      className="p-6 flex justify-between items-center bg-white shadow-md rounded-lg mb-4 hover:shadow-lg transition-shadow duration-300"
    >
      <div>
        <p className="text-sm font-medium text-gray-900">
          <span className="font-semibold">Cédula/RNC:</span>{" "}
          {receipt.rncIdentification}
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-semibold">Monto:</span> {new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
          }).format(receipt.amount)}
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-semibold">ITBIS 18%:</span> {new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
          }).format(receipt.itbis18)}
        </p>
      </div>
      <p className="text-sm text-gray-500 text-right">
        <span className="block font-semibold">Fecha:</span>
        {new Date(receipt.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default TaxRecipts;
