using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Configs
{
    public class NcfSequenceConfig : IEntityTypeConfiguration<NcfSequence>
    {
        public void Configure(EntityTypeBuilder<NcfSequence> builder)
        {
            builder.ToTable("NcfSequences");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.TipoComprobante).HasMaxLength(10);
            builder.Property(e => e.Establecimiento).HasMaxLength(10);

            // Concurrencia optimista: dos requests que incrementen la misma secuencia
            // a la vez provocan DbUpdateConcurrencyException en el perdedor, que
            // reintenta (ver NcfSequenceRepository.GenerateNextNcf) en vez de
            // producir un NCF duplicado.
            builder.Property(e => e.LastNumber).IsConcurrencyToken();

            builder.HasIndex(e => new { e.TipoComprobante, e.Establecimiento }).IsUnique();
        }
    }
}
