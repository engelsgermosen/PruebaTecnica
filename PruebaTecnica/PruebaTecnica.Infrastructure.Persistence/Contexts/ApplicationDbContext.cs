using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Common;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Contexts
{
    public partial class ApplicationDbContext : DbContext
    {
        private readonly ICurrentUserService _currentUserService;
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentUserService currentUserService)
            : base(options)
        {
            _currentUserService = currentUserService;
        }
        public DbSet<TaxPayer> TaxPayers { get; set; } = null!;
        public DbSet<TaxReceipt> TaxReceipts { get; set; } = null!;
        public DbSet<Log> Logs { get; set; } = null!;
        public DbSet<TaxPayerType> TaxPayerTypes { get; set; } = null!;

        public DbSet<NcfSequence> NcfSequences { get; set; } = null!;

        public DbSet<Product> Products { get; set; } = null!;

        public DbSet<TaxReceiptDetail> TaxReceiptDetails { get; set; } = null!;


        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach(var entry in ChangeTracker.Entries<BaseAuditableEntity>())
            {
                switch(entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.Now;
                        entry.Entity.CreatedBy = _currentUserService.UserId ?? "";
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.Now;
                        entry.Entity.UpdatedBy = _currentUserService.UserId ?? "";
                        break;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}