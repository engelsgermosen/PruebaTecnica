using PruebaTecnica.Core.Domain.Common;

namespace PruebaTecnica.Core.Domain.Entities
{
    public class TaxPayerType : BaseEntity<int>
    {
        public required string Name { get; set; }

        public ICollection<TaxPayer>? TaxPayers { get; set; } = new List<TaxPayer>();
    }
}