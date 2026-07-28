using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Core.Application.Interfaces.Services
{
    public interface ILogWriter
    {
        Task WriteAsync(Log log, CancellationToken cancellationToken = default);
    }
}