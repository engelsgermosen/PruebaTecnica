namespace PruebaTecnica.Core.Domain.Common
{
    public class BaseAuditableEntity
    {
         public DateTime CreatedAt { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string? UpdatedBy { get; set; }
    }
}