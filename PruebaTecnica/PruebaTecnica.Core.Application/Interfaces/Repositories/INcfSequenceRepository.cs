using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Core.Application.Interfaces.Repositories
{
    public interface INcfSequenceRepository : IGenericRepository<NcfSequence, int>
    {
        Task<string> GenerateNextNcf(string tipo, string? establecimiento = "0001");
    }
}