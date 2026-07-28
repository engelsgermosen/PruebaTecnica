using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Infrastructure.Persistence.Repositories
{
    public class TaxPayerRepository : GenericRepository<TaxPayer, string>, ITaxPayerRepository
    {
        private readonly ApplicationDbContext _context;
        public TaxPayerRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
    
}
