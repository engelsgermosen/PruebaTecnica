using PruebaTecnica.Core.Domain.Common;

namespace PruebaTecnica.Core.Domain.Entities
{
    public class TaxReceipt : BaseEntity<int>
    {
        public decimal Amount { get; set; }

        public decimal Itbis18 { get; set; }
        public string? Ncf { get;  set; }

        public TaxPayer? TaxPayer { get; set; }

        public string? RncIdentification { get; set; }
    }
}