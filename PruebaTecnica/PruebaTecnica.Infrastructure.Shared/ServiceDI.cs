using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Settings;
using PruebaTecnica.Infrastructure.Shared.Services;

namespace PruebaTecnica.Infrastructure.Shared
{
    public static class ServiceDI
    {
        public static void AddSharedLayer(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<EmailSettings>(config.GetSection("EmailSettings"));
            services.AddTransient<IEmailService, EmailService>();

        }
    }
}
