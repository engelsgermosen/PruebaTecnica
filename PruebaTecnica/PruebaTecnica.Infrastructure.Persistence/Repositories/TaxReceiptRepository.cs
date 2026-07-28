using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Infrastructure.Persistence.Repositories
{
    public class TaxReceiptRepository : GenericRepository<TaxReceipt, int>, ITaxReceiptRepository
    {
        private readonly ApplicationDbContext _context;
        public TaxReceiptRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
    
}
