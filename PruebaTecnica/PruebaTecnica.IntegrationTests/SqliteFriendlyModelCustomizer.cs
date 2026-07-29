using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace PruebaTecnica.IntegrationTests
{
    // El modelo trae columnas 'nvarchar(max)' (tipo de SQL Server) que Sqlite no entiende.
    // Las remapea a TEXT SOLO en el modelo de test (usado por la factory y por los tests de concurrencia).
    internal sealed class SqliteFriendlyModelCustomizer : RelationalModelCustomizer
    {
        public SqliteFriendlyModelCustomizer(ModelCustomizerDependencies dependencies) : base(dependencies) { }

        public override void Customize(ModelBuilder modelBuilder, DbContext context)
        {
            base.Customize(modelBuilder, context);

            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entity.GetProperties())
                {
                    var columnType = property.GetColumnType();
                    if (columnType is not null && columnType.Contains("(max)", StringComparison.OrdinalIgnoreCase))
                        property.SetColumnType("TEXT");
                }
            }
        }
    }
}
