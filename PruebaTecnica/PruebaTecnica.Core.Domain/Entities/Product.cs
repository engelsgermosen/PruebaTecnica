using PruebaTecnica.Core.Domain.Common;

namespace PruebaTecnica.Core.Domain.Entities
{
    public class Product : BaseEntity<int>
    {
        public required string Name { get; set; }

        public string? Description { get; set; }

        public decimal UnitPrice { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
