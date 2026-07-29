using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Infrastructure.Persistence.Contexts;
using PruebaTecnica.Infrastructure.Persistence.Repositories;

namespace PruebaTecnica.IntegrationTests
{
    // Concurrencia real del correlativo: N generaciones simultaneas del MISMO tipo
    // contra una Sqlite in-memory COMPARTIDA (cache=shared) -> sin duplicados ni huecos.
    public class NcfConcurrencyTests
    {
        private const string ConnString = "Data Source=ncf-concurrency;Mode=Memory;Cache=Shared";

        private sealed class NoUser : ICurrentUserService
        {
            public string? UserId => null;
        }

        private static async Task<T> WithContext<T>(Func<ApplicationDbContext, Task<T>> action)
        {
            using var connection = new SqliteConnection(ConnString);
            connection.Open();
            // busy_timeout: los writes concurrentes esperan en vez de fallar con SQLITE_BUSY,
            // dejando que el concurrency token (no un error de lock) maneje la coordinacion.
            using (var pragma = connection.CreateCommand())
            {
                pragma.CommandText = "PRAGMA busy_timeout = 5000;";
                pragma.ExecuteNonQuery();
            }

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection)
                .ReplaceService<IModelCustomizer, SqliteFriendlyModelCustomizer>()
                .Options;

            using var context = new ApplicationDbContext(options, new NoUser());
            return await action(context);
        }

        [Fact]
        public async Task Concurrent_Generation_Same_Type_Produces_No_Duplicates_And_No_Gaps()
        {
            const int n = 10;

            // Conexion keep-alive: mantiene viva la BD in-memory compartida durante todo el test.
            using var keepAlive = new SqliteConnection(ConnString);
            await keepAlive.OpenAsync();

            await WithContext(async ctx =>
            {
                await ctx.Database.EnsureCreatedAsync();
                return true;
            });

            // N generaciones en paralelo, cada una con su propio contexto/conexion.
            // Bajo contencion extrema, alguna puede agotar los 5 retries y lanzar el error
            // claro (comportamiento acotado por diseno). Se captura para verificar el invariante.
            var tasks = Enumerable.Range(0, n)
                .Select(_ => Task.Run(async () =>
                {
                    try
                    {
                        return await WithContext(ctx => new NcfSequenceRepository(ctx).GenerateNextNcf("B01"));
                    }
                    catch (ApiException)
                    {
                        return null; // agoto retries: no consumio numero (no genera hueco)
                    }
                }))
                .ToArray();

            var results = await Task.WhenAll(tasks);
            var succeeded = results.Where(x => x is not null).Select(x => x!).ToArray();

            succeeded.Should().NotBeEmpty();

            // INVARIANTE: sin duplicados.
            succeeded.Should().OnlyHaveUniqueItems();

            // INVARIANTE: sin huecos. Las generadas son exactamente el correlativo 1..K (contiguo).
            var numbers = succeeded.Select(x => int.Parse(x[3..])).OrderBy(x => x).ToArray();
            numbers.Should().Equal(Enumerable.Range(1, succeeded.Length).ToArray());

            // Formato correcto (B01 + 8 digitos).
            succeeded.Should().OnlyContain(x => x.Length == 11 && x.StartsWith("B01"));
        }
    }
}
