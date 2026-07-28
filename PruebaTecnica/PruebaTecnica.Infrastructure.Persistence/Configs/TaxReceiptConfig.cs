using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Configs
{
    public class TaxReceiptConfig : IEntityTypeConfiguration<TaxReceipt>
    {
        public void Configure(EntityTypeBuilder<TaxReceipt> builder)
        {
            builder.ToTable("TaxReceipts");
                builder.HasKey(e => e.Id);
                builder.Property(e => e.Id).ValueGeneratedOnAdd();


                builder.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                builder.Property(e => e.Itbis18)
                    .HasColumnType("decimal(18,2)")
                    .HasComputedColumnSql("([Amount] * 0.18)", true)
                    .ValueGeneratedOnAddOrUpdate();
                //builder.Property(e => e.Ncf).HasMaxLength(20).HasComputedColumnSql(
                //    "('E31' + RIGHT(REPLICATE('0',8) + CAST([Id] AS VARCHAR(8)), 8))", true)
                //.ValueGeneratedOnAddOrUpdate();
                builder.Property(e => e.RncIdentification).HasMaxLength(20);

                builder.Property(e => e.Ncf).HasMaxLength(20);
                builder.HasIndex(e => e.Ncf).IsUnique();
        }
    }
}