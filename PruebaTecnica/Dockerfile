FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# csproj primero => capa de restore cacheada
COPY PruebaTecnica.WebApi/*.csproj                    PruebaTecnica.WebApi/
COPY PruebaTecnica.Core.Application/*.csproj          PruebaTecnica.Core.Application/
COPY PruebaTecnica.Core.Domain/*.csproj               PruebaTecnica.Core.Domain/
COPY PruebaTecnica.Infrastructure.Identity/*.csproj   PruebaTecnica.Infrastructure.Identity/
COPY PruebaTecnica.Infrastructure.Persistence/*.csproj PruebaTecnica.Infrastructure.Persistence/
COPY PruebaTecnica.Infrastructure.Shared/*.csproj     PruebaTecnica.Infrastructure.Shared/

RUN dotnet restore PruebaTecnica.WebApi/PruebaTecnica.WebApi.csproj

# Solo el código que necesita el build
COPY PruebaTecnica.WebApi/                    PruebaTecnica.WebApi/
COPY PruebaTecnica.Core.Application/          PruebaTecnica.Core.Application/
COPY PruebaTecnica.Core.Domain/               PruebaTecnica.Core.Domain/
COPY PruebaTecnica.Infrastructure.Identity/   PruebaTecnica.Infrastructure.Identity/
COPY PruebaTecnica.Infrastructure.Persistence/ PruebaTecnica.Infrastructure.Persistence/
COPY PruebaTecnica.Infrastructure.Shared/     PruebaTecnica.Infrastructure.Shared/

RUN dotnet publish PruebaTecnica.WebApi/PruebaTecnica.WebApi.csproj \
    -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "PruebaTecnica.WebApi.dll"]