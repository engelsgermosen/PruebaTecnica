using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application;
using PruebaTecnica.Infrastructure.Identity;
using PruebaTecnica.Infrastructure.Identity.Contexts;
using PruebaTecnica.Infrastructure.Persistence;
using PruebaTecnica.Infrastructure.Persistence.Contexts;
using PruebaTecnica.Infrastructure.Shared;
using PruebaTecnica.WebApi.Extensions;
using PruebaTecnica.WebApi.Middlewares;
using Serilog;
using Serilog.Formatting.Compact;
using System.Diagnostics;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Serilog: lee niveles de configuracion (seccion "Serilog"), enriquece con LogContext
// y escribe JSON compacto a stdout (lo que lee `docker compose logs`).
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console(new CompactJsonFormatter()));

// Add services to the container.
builder.Services.AddControllers(opt =>
{
    opt.Filters.Add(new ProducesAttribute("application/json"));
}).ConfigureApiBehaviorOptions(opt =>
{
    opt.SuppressInferBindingSourcesForParameters = true;
    opt.SuppressMapClientErrors = true;
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerExtensions();
builder.Services.AddApiVersioningExtension();


builder.Services.AddApplicationLayer();
builder.Services.AddPersistenceLayer(builder.Configuration);
builder.Services.AddIdentityLayer(builder.Configuration);
builder.Services.AddSharedLayer(builder.Configuration);

builder.Services.AddHealthChecks();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(builder =>
{
    builder.AddPolicy("Front", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var dbIdentity = scope.ServiceProvider.GetRequiredService<IdentityContext>();

    await db.Database.MigrateAsync();
    await dbIdentity.Database.MigrateAsync();
}

await app.Services.RunIdentitySeedAsync();
await app.Services.RunAppSeeds();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwaggerExtension(app);
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseCors("Front");
app.UseRouting();

// Una linea por request (metodo, ruta, status, ms). Va despues de UseRouting
// para tener metadata de endpoint, y ENVUELVE al UseExceptionHandler (queda por
// fuera) para que las excepciones ya manejadas no re-adjunten stack al request-log.
app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("TraceId", Activity.Current?.Id ?? httpContext.TraceIdentifier);
        diagnosticContext.Set("UserId", httpContext.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous");
    };
});

app.UseExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();


app.UseHealthChecks("/health");

app.MapControllers();

await app.RunAsync();
