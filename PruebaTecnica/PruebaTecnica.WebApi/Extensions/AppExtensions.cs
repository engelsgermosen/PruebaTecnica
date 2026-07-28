using Swashbuckle.AspNetCore.SwaggerUI;

namespace PruebaTecnica.WebApi.Extensions
{
    public static class AppExtensions
    {
        public static void UseSwaggerExtension(this IApplicationBuilder app, IEndpointRouteBuilder routeBuilder)
        {
            app.UseSwagger();
            app.UseSwaggerUI(opt =>
            {

                var versionDescriptions = routeBuilder.DescribeApiVersions();

                foreach (var version in versionDescriptions)
                {
                    var url = $"/swagger/{version.GroupName}/swagger.json";
                    var name = $"PruebaTecnica-API - {version.GroupName.ToUpperInvariant()}";
                    opt.SwaggerEndpoint(url, name);
                }
                opt.DefaultModelRendering(ModelRendering.Model);
            });
        }
    }
}
