using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Configs
{
    public class ProductConfig : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.Name).HasMaxLength(150).IsRequired();
            builder.Property(e => e.Description).HasMaxLength(500);
            builder.Property(e => e.UnitPrice).HasPrecision(18, 2);
            builder.Property(e => e.IsActive).HasDefaultValue(true);

            builder.HasIndex(e => e.Name).IsUnique();
        }
    }
}
