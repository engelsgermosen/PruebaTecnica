namespace PruebaTecnica.Core.Application.Dtos.TaxReceipt
{
    public class TaxReceiptDto
    {
        public int Id { get; set; }
        public string? RncIdentification { get; set; }
        public string? Ncf { get; set; }

        // Base imponible (suma de subtotales).
        public decimal? Amount { get; set; }
        // Impuesto calculado.
        public decimal? Itbis18 { get; set; }
        // Amount + Itbis18.
        public decimal? Total { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<TaxReceiptDetailDto> Details { get; set; } = new();
    }
}
