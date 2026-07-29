using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Infrastructure.Persistence.Repositories
{
    public class ProductRepository : GenericRepository<Product, int>, IProductRepository
    {
        private readonly ApplicationDbContext _context;
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
