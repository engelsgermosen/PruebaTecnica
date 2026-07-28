namespace PruebaTecnica.Core.Application.Dtos.TaxReceipt
{
    public class TaxReceiptDto
    {
        public int Id { get; set; }
        public string? RncIdentification { get; set; }
        public string? Ncf { get; set; }
        public decimal? Amount { get; set; }
        public decimal? Itbis18 { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}