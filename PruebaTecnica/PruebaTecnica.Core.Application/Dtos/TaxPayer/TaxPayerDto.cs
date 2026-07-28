using PruebaTecnica.Core.Application.Dtos.TaxReceipt;

namespace PruebaTecnica.Core.Application.Dtos.TaxPayer
{
    public class TaxPayerDto
    {
        public string RncIdentification { get; set; } = null!;
        public required string Name { get; set; }

        public bool Status { get; set; } = true;

        public int TaxPayerTypeId { get; set; }
        public string? Type { get; set; }

        public ICollection<TaxReceiptDto>? TaxReceipts { get; set; }
    }
}