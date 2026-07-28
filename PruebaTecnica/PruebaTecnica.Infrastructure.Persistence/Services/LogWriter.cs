using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Infrastructure.Persistence.Services
{
    public sealed class LogWriter : ILogWriter
    {
        private readonly IServiceProvider _sp;


    public LogWriter(IServiceProvider provider) => _sp = provider;
        public async Task WriteAsync(Log log, CancellationToken ct = default)
        {
            using var scope = _sp.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ctx.Set<Log>().AddAsync(log, ct);
            await ctx.SaveChangesAsync(ct);
        }
    }
}