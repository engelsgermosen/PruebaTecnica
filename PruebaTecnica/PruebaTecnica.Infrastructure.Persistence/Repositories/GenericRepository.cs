namespace PruebaTecnica.Infrastructure.Persistence.Repositories
{
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using PruebaTecnica.Core.Application.Interfaces.Repositories;
    using PruebaTecnica.Core.Domain.Common;
    using PruebaTecnica.Infrastructure.Persistence.Contexts;

    public class GenericRepository<T,TKey > : IGenericRepository<T, TKey> where T : BaseEntity<TKey>
    {
        private readonly ApplicationDbContext _context;

        public GenericRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        } 

        public virtual async Task DeleteAsync(T entity)
        {
            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task<T?> GetByIdAsync(TKey id)
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public IQueryable<T> GetQuery()
        {
            return _context.Set<T>().AsQueryable();
        }

        public virtual async Task<T> UpdateAsync(T entity, TKey id)
        {
            T? entry = await GetByIdAsync(id);

            if (entry == null)
            {
                throw new KeyNotFoundException($"Entidad con id '{id}' no encontrada.");
            }

            // SetValues copia todas las propiedades escalares del objeto entrante,
            // que llega sin campos de auditoria de creacion: se preservan los de la BD.
            var createdAt = entry.CreatedAt;
            var createdBy = entry.CreatedBy;

            _context.Set<T>().Entry(entry).CurrentValues.SetValues(entity);
            entry.CreatedAt = createdAt;
            entry.CreatedBy = createdBy;

            await _context.SaveChangesAsync();
            return entry;
        }
        
        public virtual async Task<IList<T>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Set<T>().OrderBy(x => x.Id).ToListAsync(cancellationToken);
        }
    }
}