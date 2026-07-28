using PruebaTecnica.Core.Domain.Common;

namespace PruebaTecnica.Core.Application.Interfaces.Repositories
{
    public interface IGenericRepository<TEntity, TKey> where TEntity : BaseEntity<TKey>
    {
        Task<TEntity?> GetByIdAsync(TKey id);
        IQueryable<TEntity> GetQuery();
        Task<TEntity> AddAsync(TEntity entity);
        Task<TEntity> UpdateAsync(TEntity entity, TKey id);
        Task DeleteAsync(TEntity entity);
        Task<IList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    }
}
