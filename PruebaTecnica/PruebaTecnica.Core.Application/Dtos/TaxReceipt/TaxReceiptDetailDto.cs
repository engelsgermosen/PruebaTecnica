namespace PruebaTecnica.Core.Application.Dtos.TaxReceipt
{
    // DTO de salida de una linea del comprobante (incluye el snapshot).
    public class TaxReceiptDetailDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
    }
}
