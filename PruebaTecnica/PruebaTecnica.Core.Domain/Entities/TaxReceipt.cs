using PruebaTecnica.Core.Domain.Common;
using PruebaTecnica.Core.Domain.Constants;

namespace PruebaTecnica.Core.Domain.Entities
{
    public class TaxReceipt : BaseEntity<int>
    {
        // Base imponible (suma de subtotales). Calculada en el servidor.
        public decimal Amount { get; set; }

        // Impuesto calculado. Calculado en el servidor.
        public decimal Itbis18 { get; set; }

        // Amount + Itbis18. Calculado en el servidor.
        public decimal Total { get; set; }

        public string? Ncf { get;  set; }

        public TaxPayer? TaxPayer { get; set; }

        public string? RncIdentification { get; set; }

        public ICollection<TaxReceiptDetail> Details { get; set; } = new List<TaxReceiptDetail>();

        // Agrega una linea copiando el snapshot (nombre + precio) del producto y calculando el subtotal.
        public void AddDetail(Product product, int quantity)
        {
            var subtotal = Math.Round(quantity * product.UnitPrice, 2, MidpointRounding.AwayFromZero);

            Details.Add(new TaxReceiptDetail
            {
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.UnitPrice,
                Quantity = quantity,
                Subtotal = subtotal
            });
        }

        // Calcula Amount, Itbis18 y Total a partir de las lineas de detalle.
        public void CalculateTotals()
        {
            Amount = Details.Sum(d => d.Subtotal);
            Itbis18 = Math.Round(Amount * TaxRates.Itbis, 2, MidpointRounding.AwayFromZero);
            Total = Amount + Itbis18;
        }
    }
}
