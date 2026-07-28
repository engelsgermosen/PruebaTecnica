using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Infrastructure.Persistence.Repositories
{
    public class LogRepository : GenericRepository<Log, int>, ILogRepository
    {
        private readonly ApplicationDbContext _context;
        public LogRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
    
}
