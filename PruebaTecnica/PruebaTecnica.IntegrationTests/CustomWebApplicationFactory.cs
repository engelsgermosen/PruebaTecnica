using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PruebaTecnica.Infrastructure.Identity.Contexts;
using PruebaTecnica.Infrastructure.Persistence.Contexts;
using PruebaTecnica.WebApi.Middlewares;

namespace PruebaTecnica.IntegrationTests
{
    // WebApplicationFactory que reemplaza SQL Server por Sqlite in-memory (relacional: respeta
    // FKs, Restrict y precision decimal) y neutraliza Redis usando cache distribuido en memoria.
    // NOTA: Program.cs no expone una clase 'Program' publica (la nota del enunciado no coincide con
    // el codigo), asi que se usa un tipo publico del ensamblado WebApi como punto de entrada.
    // WebApplicationFactory<TEntryPoint> solo usa el ENSAMBLADO de TEntryPoint para hallar el host.
    public class CustomWebApplicationFactory : WebApplicationFactory<GlobalExceptionHandler>
    {
        // Las conexiones Sqlite in-memory deben permanecer ABIERTAS toda la vida de la factory,
        // o la base desaparece.
        private readonly SqliteConnection _appConnection = new("DataSource=:memory:");
        private readonly SqliteConnection _identityConnection = new("DataSource=:memory:");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            _appConnection.Open();
            _identityConnection.Open();

            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    // Vacio => AddPersistenceLayer usa AddDistributedMemoryCache (sin Redis).
                    ["Caching:RedisConnection"] = ""
                });
            });

            builder.ConfigureTestServices(services =>
            {
                ReplaceDbContext<ApplicationDbContext>(services, _appConnection);
                ReplaceDbContext<IdentityContext>(services, _identityConnection);
            });
        }

        private static void ReplaceDbContext<TContext>(IServiceCollection services, DbConnection connection)
            where TContext : DbContext
        {
            var toRemove = services.Where(d =>
                d.ServiceType == typeof(DbContextOptions<TContext>) ||
                d.ServiceType == typeof(TContext)).ToList();
            foreach (var descriptor in toRemove)
                services.Remove(descriptor);

            // Program.cs corre MigrateAsync al arrancar; las migraciones son de SQL Server
            // (nvarchar(max), etc.) e incompatibles con Sqlite. Reemplazamos IMigrator para que
            // "migrar" cree el esquema desde el modelo (EnsureCreated, tipos nativos Sqlite).
            services.AddDbContext<TContext>(options => options
                .UseSqlite(connection)
                .ReplaceService<IMigrator, EnsureCreatedMigrator>()
                .ReplaceService<IModelCustomizer, SqliteFriendlyModelCustomizer>());
        }

        // "Migrador" que ignora las migraciones y crea el esquema desde el modelo.
        private sealed class EnsureCreatedMigrator : IMigrator
        {
            private readonly ICurrentDbContext _current;
            public EnsureCreatedMigrator(ICurrentDbContext current) => _current = current;

            public void Migrate(string? targetMigration = null)
                => _current.Context.Database.EnsureCreated();

            public Task MigrateAsync(string? targetMigration = null, CancellationToken cancellationToken = default)
                => _current.Context.Database.EnsureCreatedAsync(cancellationToken);

            public string GenerateScript(string? fromMigration = null, string? toMigration = null,
                MigrationsSqlGenerationOptions options = MigrationsSqlGenerationOptions.Default)
                => string.Empty;
        }

        // Deja la base de dominio limpia; cada test siembra sus propios datos.
        public async Task ResetAppDataAsync()
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            db.TaxReceiptDetails.RemoveRange(db.TaxReceiptDetails);
            db.TaxReceipts.RemoveRange(db.TaxReceipts);
            db.Products.RemoveRange(db.Products);
            db.TaxPayers.RemoveRange(db.TaxPayers);
            db.TaxPayerTypes.RemoveRange(db.TaxPayerTypes);
            // Reiniciar los correlativos para que la generacion de NCF sea determinista por test.
            db.NcfSequences.RemoveRange(db.NcfSequences);
            await db.SaveChangesAsync();
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing)
            {
                _appConnection.Dispose();
                _identityConnection.Dispose();
            }
        }
    }
}
