using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Infrastructure.Persistence.Repositories
{
    public class NcfSequenceRepository : GenericRepository<NcfSequence, int>, INcfSequenceRepository
    {
        private const int MaxAttempts = 5;

        private readonly ApplicationDbContext _context;
        public NcfSequenceRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        // Genera el siguiente NCF correlativo del tipo indicado, seguro ante concurrencia:
        // LastNumber es concurrency token; el request perdedor recibe DbUpdateConcurrencyException,
        // RECARGA SOLO la fila de secuencia (no todo el tracker) y reintenta sobre el valor fresco.
        // Acotado a MaxAttempts; agotado lanza error claro.
        public async Task<string> GenerateNextNcf(string tipo, string? establecimiento = "0001")
        {
            establecimiento ??= "0001";

            NcfSequence? seq = null;

            for (var attempt = 1; attempt <= MaxAttempts; attempt++)
            {
                // Obtiene (o crea) la fila de secuencia. En un retry por concurrencia 'seq' ya viene
                // recargada, asi que solo se relee cuando hubo que descartarla (choque de insert).
                if (seq == null)
                {
                    seq = await _context.NcfSequences.FirstOrDefaultAsync(x =>
                        x.TipoComprobante == tipo &&
                        x.Establecimiento == establecimiento);

                    if (seq == null)
                    {
                        seq = new NcfSequence
                        {
                            TipoComprobante = tipo,
                            Establecimiento = establecimiento,
                            LastNumber = 0
                        };
                        await _context.NcfSequences.AddAsync(seq);
                    }
                }

                seq.LastNumber++;

                try
                {
                    // SaveChanges propio: consume SOLO la fila-secuencia (no el comprobante).
                    await _context.SaveChangesAsync();

                    var secuencia = seq.LastNumber.ToString().PadLeft(8, '0');
                    // Formato dominicano: letra de serie + 2 digitos de tipo + 8 de secuencia (ej. B0100000001).
                    return $"{tipo}{secuencia}";
                }
                catch (DbUpdateConcurrencyException)
                {
                    // Otro request incremento primero (LastNumber es concurrency token).
                    // Recarga SOLO esta fila desde BD (deja el resto del tracker intacto) y reintenta
                    // el incremento sobre el valor fresco.
                    await _context.Entry(seq).ReloadAsync();
                }
                catch (DbUpdateException)
                {
                    // Choque del indice unico al crear la misma fila-secuencia en paralelo.
                    // Reload detach-a la fila fantasma (no existe en BD); el proximo intento lee la ganadora.
                    await _context.Entry(seq).ReloadAsync();
                    seq = null;
                }
            }

            throw new ApiException(
                $"No se pudo generar el NCF para el tipo '{tipo}' tras {MaxAttempts} intentos por alta concurrencia. Reintente.",
                409);
        }
    }
}
