namespace PruebaTecnica.Core.Domain.Common
{
    public abstract class BaseEntity<TKey> : BaseAuditableEntity
    {
        public TKey Id { get; set; } = default!;
    }
}