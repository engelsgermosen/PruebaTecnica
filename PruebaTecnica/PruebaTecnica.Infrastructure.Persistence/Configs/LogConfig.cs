using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Configs
{
    public class LogConfig : IEntityTypeConfiguration<Log>
    {
        public void Configure(EntityTypeBuilder<Log> builder)
        {
            builder.ToTable("Logs");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.Level).HasMaxLength(50);
            builder.Property(e => e.Message).HasMaxLength(256);
            builder.Property(e => e.Detail).HasColumnType("nvarchar(max)");
            builder.Property(e => e.User).HasMaxLength(100);
            builder.Property(e => e.Endpoint).HasMaxLength(100);

            builder.Ignore(e => e.CreatedAt);
            builder.Ignore(e => e.CreatedBy);
            builder.Ignore(e => e.UpdatedAt);
            builder.Ignore(e => e.UpdatedBy);
        }
    }
}