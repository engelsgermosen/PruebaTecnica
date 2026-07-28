using PruebaTecnica.Core.Domain.Common;

namespace PruebaTecnica.Core.Domain.Entities
{
    public class TaxPayer : BaseEntity<string>
    {
        public required string Name { get; set; }

        public bool Status { get; set; } = true;

        public TaxPayerType? TaxPayerType { get; set; }
        public int? TaxPayerTypeId { get; set; } 

        public ICollection<TaxReceipt>? TaxReceipts { get; set; } = new List<TaxReceipt>();
    }
}