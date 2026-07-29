using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Configs
{
    public class TaxReceiptDetailConfig : IEntityTypeConfiguration<TaxReceiptDetail>
    {
        public void Configure(EntityTypeBuilder<TaxReceiptDetail> builder)
        {
            builder.ToTable("TaxReceiptDetails");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.ProductName).HasMaxLength(150).IsRequired();
            builder.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            builder.Property(e => e.Subtotal).HasColumnType("decimal(18,2)");

            // El detalle muere con el comprobante.
            builder.HasOne(e => e.TaxReceipt)
                   .WithMany(r => r.Details)
                   .HasForeignKey(e => e.TaxReceiptId)
                   .OnDelete(DeleteBehavior.Cascade);

            // No permitir borrar un producto usado en un comprobante.
            builder.HasOne(e => e.Product)
                   .WithMany()
                   .HasForeignKey(e => e.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
