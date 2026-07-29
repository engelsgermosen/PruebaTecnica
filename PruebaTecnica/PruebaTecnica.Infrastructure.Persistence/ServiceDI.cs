using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Settings;
using PruebaTecnica.Infrastructure.Persistence.Contexts;
using PruebaTecnica.Infrastructure.Persistence.Repositories;
using PruebaTecnica.Infrastructure.Persistence.Seeds;
using PruebaTecnica.Infrastructure.Persistence.Services;

namespace PruebaTecnica.Infrastructure.Persistence
{
    public static class ServiceDI
    {
        // Extenions metodo
        public static void AddPersistenceLayer(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<ApplicationDbContext>(opt =>
            {
                opt.UseSqlServer(config.GetConnectionString("DefaultConnection"), m =>
                {
                    m.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                });
            });

            // services.AddPooledDbContextFactory<ApplicationDbContext>(opt =>
            // {
            //     opt.UseSqlServer(config.GetConnectionString("DefaultConnection"), m =>
            //     {
            //         m.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            //     });
            // });


            services.AddTransient(typeof(IGenericRepository<,>), typeof(GenericRepository<,>));
            services.AddTransient<ILogRepository, LogRepository>();
            services.AddTransient<ITaxPayerRepository, TaxPayerRepository>();
            services.AddTransient<ITaxPayerTypeRepository, TaxPayerTypeRepository>();
            services.AddTransient<ITaxReceiptRepository, TaxReceiptRepository>();
            services.AddTransient<INcfSequenceRepository, NcfSequenceRepository>();
            services.AddTransient<IProductRepository, ProductRepository>();
            services.AddSingleton<ILogWriter, LogWriter>();


            #region Caching

            var cacheSettings = config.GetSection("Caching").Get<CacheSettings>() ?? new CacheSettings();
            services.Configure<CacheSettings>(config.GetSection("Caching"));

            if (!string.IsNullOrWhiteSpace(cacheSettings.RedisConnection))
            {
                services.AddStackExchangeRedisCache(opt =>
                {
                    opt.Configuration = cacheSettings.RedisConnection;
                    opt.InstanceName = cacheSettings.InstanceName;
                });
            }
            else
            {
                // Sin Redis configurado (desarrollo/tests): cache distribuido en memoria
                services.AddDistributedMemoryCache();
            }

            services.AddSingleton<ICacheService, RedisCacheService>();

            #endregion

        }

        public static async Task RunAppSeeds(this IServiceProvider serviceProvider)
        {
            try
            {
                using (var scope = serviceProvider.CreateScope())
                {
                    var services = scope.ServiceProvider;

                    var taxPayerTypeRepository = services.GetRequiredService<ITaxPayerTypeRepository>();
                    await DefaultTaxPayerTypes.RunTaxPayerTypeSeedAsync(taxPayerTypeRepository);

                    var productRepository = services.GetRequiredService<IProductRepository>();
                    await DefaultProducts.RunProductSeedAsync(productRepository);

                    var taxPayerRepository = services.GetRequiredService<ITaxPayerRepository>();
                    await DefaultTaxPayers.RunTaxPayerSeedAsync(taxPayerRepository, taxPayerTypeRepository);

                    var dbContext = services.GetRequiredService<ApplicationDbContext>();
                    var ncfSequenceRepository = services.GetRequiredService<INcfSequenceRepository>();
                    await DefaultTaxReceipts.RunTaxReceiptSeedAsync(dbContext, ncfSequenceRepository);
                }
            }
            catch
            {
                // 
            }
        }
    }
    
}
