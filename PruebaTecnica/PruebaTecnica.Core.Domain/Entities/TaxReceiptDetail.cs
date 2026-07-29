using PruebaTecnica.Core.Domain.Common;

namespace PruebaTecnica.Core.Domain.Entities
{
    public class TaxReceiptDetail : BaseEntity<int>
    {
        public int TaxReceiptId { get; set; }
        public TaxReceipt? TaxReceipt { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        // Snapshot: nombre y precio se copian del producto al emitir.
        // Cambiar el producto luego NO altera comprobantes ya emitidos.
        public required string ProductName { get; set; }
        public decimal UnitPrice { get; set; }

        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
    }
}
