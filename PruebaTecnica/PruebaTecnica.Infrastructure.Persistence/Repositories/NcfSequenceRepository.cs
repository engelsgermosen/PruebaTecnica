using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Infrastructure.Persistence.Repositories
{
    public class NcfSequenceRepository : GenericRepository<NcfSequence, int>, INcfSequenceRepository
    {
        private readonly ApplicationDbContext _context;
        public NcfSequenceRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<string> GenerateNextNcf(string tipo, string? establecimiento = "0001")
        {
            const int maxAttempts = 5;

            for (var attempt = 1; ; attempt++)
            {
                try
                {
                    var seq = await _context.NcfSequences.FirstOrDefaultAsync(x =>
                            x.TipoComprobante == tipo &&
                            x.Establecimiento == establecimiento);

                    if (seq == null)
                    {
                        seq = new NcfSequence
                        {
                            TipoComprobante = tipo,
                            Establecimiento = establecimiento ?? "0001",
                            LastNumber = 0
                        };
                        await _context.NcfSequences.AddAsync(seq);
                    }

                    seq.LastNumber++;

                    await _context.SaveChangesAsync();

                    string secuencia = seq.LastNumber.ToString().PadLeft(8, '0');
                    return $"{tipo}{establecimiento}{secuencia}";
                }
                catch (DbUpdateConcurrencyException) when (attempt < maxAttempts)
                {
                    // Otro request incremento la secuencia primero (LastNumber es
                    // concurrency token): se descarta el estado local y se reintenta.
                    _context.ChangeTracker.Clear();
                }
                catch (DbUpdateException) when (attempt < maxAttempts)
                {
                    // Choque del indice unico al crear la misma secuencia en paralelo:
                    // se reintenta leyendo la fila que gano.
                    _context.ChangeTracker.Clear();
                }
            }
        }
    }
    
}
