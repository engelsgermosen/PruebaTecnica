using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Configs
{
    public class TaxPayerConfig : IEntityTypeConfiguration<TaxPayer>
    {
        public void Configure(EntityTypeBuilder<TaxPayer> builder)
        {

                builder.ToTable("TaxPayers");
                builder.HasKey(e => e.Id);
                builder.Property(e => e.Id).ValueGeneratedNever();
                builder.Property(e => e.Id).HasMaxLength(20).HasColumnName("RncIdentification");
            builder.Property(e => e.Name).HasMaxLength(100);
                
                builder.HasMany(e => e.TaxReceipts)
                        .WithOne(e => e.TaxPayer)
                        .HasForeignKey(e => e.RncIdentification)
                        .OnDelete(DeleteBehavior.Cascade);
        }
    }
}