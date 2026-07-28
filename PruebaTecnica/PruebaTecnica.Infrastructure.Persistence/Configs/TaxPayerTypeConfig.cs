using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Configs
{
    public class TaxPayerTypeConfig : IEntityTypeConfiguration<TaxPayerType>
    {
        public void Configure(EntityTypeBuilder<TaxPayerType> builder)
        {
            builder.ToTable("TaxPayerTypes");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.Name).HasMaxLength(100);
            builder.HasIndex(e => e.Name).IsUnique();

            builder.HasMany(e => e.TaxPayers)
                        .WithOne(e => e.TaxPayerType)
                        .HasForeignKey(e => e.TaxPayerTypeId)
                        .OnDelete(DeleteBehavior.Cascade);
        }
    }
}