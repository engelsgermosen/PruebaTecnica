using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Settings;
using PruebaTecnica.Infrastructure.Identity.Contexts;
using PruebaTecnica.Infrastructure.Identity.Entities;
using PruebaTecnica.Infrastructure.Identity.Seeds;
using PruebaTecnica.Infrastructure.Identity.Services;

namespace PruebaTecnica.Infrastructure.Identity
{
    public static class ServiceDI
    {
        public static void AddIdentityLayer(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<IdentityContext>(opt =>
            {
                opt.UseSqlServer(config.GetConnectionString("IdentityConnection"), m =>
                {
                    m.MigrationsAssembly(typeof(IdentityContext).Assembly.FullName);
                });
            });

            services.Configure<JwtSettings>(config.GetSection("JwtSettings"));
            services.AddTransient<IAuthService, AuthService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();

            services.AddIdentityCore<ApplicationUser>()
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<IdentityContext>()
                .AddTokenProvider<DataProtectorTokenProvider<ApplicationUser>>(TokenOptions.DefaultProvider);

            services.Configure<DataProtectionTokenProviderOptions>(opt =>
            {
                opt.TokenLifespan = TimeSpan.FromHours(2);
            });

            services.AddAuthentication(opt =>
            {
                opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(opt =>
            {
                opt.SaveToken = false;
                opt.RequireHttpsMetadata = false;
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,

                    ValidIssuer = config["JwtSettings:Issuer"],
                    ValidAudience = config["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JwtSettings:Key"]!))
                };

                opt.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = ctx =>
                    {
                        if (ctx.Exception is SecurityTokenExpiredException)
                        {
                            ctx.Fail("TokenExpired");
                        }

                       return Task.CompletedTask;
                    },

                    OnChallenge = ctx =>
                    {
                        ctx.HandleResponse();

                        if (!ctx.Response.HasStarted)
                        {
                            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            ctx.Response.ContentType = "application/json";

                            var isExpired = ctx.AuthenticateFailure?.Message == "TokenExpired";

                            var payload = new
                            {
                                error = isExpired ? "TokenExpired" : "Unauthorized",
                                message = isExpired
                                    ? "Token has expired"
                                    : "You are not authorized"
                            };

                            return ctx.Response.WriteAsJsonAsync(payload);
                        }

                        return Task.CompletedTask;
                    },

                    OnForbidden = ctx =>
                    {
                        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                        ctx.Response.ContentType = "application/json";

                        var payload = new
                        {
                            error = "Forbidden",
                            message = "You do not have permission to access this resource"
                        };

                        return ctx.Response.WriteAsJsonAsync(payload);

                    }
                };
            });
        }


        public static async Task RunIdentitySeedAsync(this IServiceProvider serviceProvider)
        {
            try
            {
                using(var scope = serviceProvider.CreateScope())
                {
                    var services = scope.ServiceProvider;

                    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
                    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

                    await DefaultUser.RunSeedAsync(userManager, roleManager);
                }
            }
            catch 
            {
                //
            }
        }
    }
}
