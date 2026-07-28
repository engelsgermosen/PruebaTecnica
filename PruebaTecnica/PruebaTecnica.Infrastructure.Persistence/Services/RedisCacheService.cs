using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Settings;

namespace PruebaTecnica.Infrastructure.Persistence.Services
{
    /// <summary>
    /// Cache-aside sobre Redis (IDistributedCache) con:
    ///  - Grupos versionados: la clave real es "{group}:v{version}:{key}"; invalidar un
    ///    grupo solo cambia su version (O(1), sin SCAN/KEYS sobre Redis). Las entradas
    ///    de versiones viejas expiran solas por su TTL.
    ///  - Fail-open: si Redis no responde, se ejecuta la factory (BD) y se registra un
    ///    warning, en vez de propagar la excepcion como 500 al cliente.
    ///  - Serializacion y TTL centralizados (defaults en CacheSettings).
    /// </summary>
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;
        private readonly CacheSettings _settings;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(
            IDistributedCache cache,
            IOptions<CacheSettings> settings,
            ILogger<RedisCacheService> logger)
        {
            _cache = cache;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<T> GetOrCreateAsync<T>(
            string group,
            string key,
            Func<CancellationToken, Task<T>> factory,
            CacheEntryOptions? options = null,
            CancellationToken cancellationToken = default)
        {
            if (!_settings.Enabled)
                return await factory(cancellationToken);

            string? fullKey = null;
            try
            {
                fullKey = await BuildFullKeyAsync(group, key, cancellationToken);

                var cached = await _cache.GetStringAsync(fullKey, cancellationToken);
                if (!string.IsNullOrEmpty(cached))
                {
                    var hit = JsonConvert.DeserializeObject<T>(cached);
                    if (hit is not null)
                        return hit;
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogWarning(ex, "Cache no disponible al leer '{Group}:{Key}'; se consulta la fuente directamente.", group, key);
                fullKey = null; // la lectura fallo: no intentar escribir tampoco
            }

            var value = await factory(cancellationToken);

            if (fullKey is not null && value is not null)
            {
                try
                {
                    var serialized = JsonConvert.SerializeObject(value);
                    await _cache.SetStringAsync(fullKey, serialized, BuildEntryOptions(options), cancellationToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogWarning(ex, "Cache no disponible al escribir '{Group}:{Key}'.", group, key);
                }
            }

            return value;
        }

        public async Task RemoveAsync(string group, string key, CancellationToken cancellationToken = default)
        {
            if (!_settings.Enabled)
                return;

            try
            {
                var fullKey = await BuildFullKeyAsync(group, key, cancellationToken);
                await _cache.RemoveAsync(fullKey, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogWarning(ex, "Cache no disponible al eliminar '{Group}:{Key}'.", group, key);
            }
        }

        public async Task InvalidateGroupAsync(string group, CancellationToken cancellationToken = default)
        {
            if (!_settings.Enabled)
                return;

            try
            {
                // Ticks UTC como version: monotona y nunca se repite, asi una version
                // vieja no puede "resucitar" aunque el contador se pierda o resetee.
                var newVersion = DateTime.UtcNow.Ticks.ToString();
                await _cache.SetStringAsync(VersionKey(group), newVersion, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Se pierde esta invalidacion, pero el AbsoluteExpiration de las
                // entradas acota la ventana de datos obsoletos.
                _logger.LogWarning(ex, "Cache no disponible al invalidar el grupo '{Group}'.", group);
            }
        }

        private async Task<string> BuildFullKeyAsync(string group, string key, CancellationToken cancellationToken)
        {
            var version = await _cache.GetStringAsync(VersionKey(group), cancellationToken) ?? "0";
            return $"{group}:v{version}:{key}";
        }

        private static string VersionKey(string group) => $"cache-version:{group}";

        private DistributedCacheEntryOptions BuildEntryOptions(CacheEntryOptions? options)
        {
            var sliding = options?.SlidingExpiration
                ?? TimeSpan.FromMinutes(_settings.DefaultSlidingExpirationMinutes);
            var absolute = options?.AbsoluteExpiration
                ?? TimeSpan.FromMinutes(_settings.DefaultAbsoluteExpirationMinutes);

            var entryOptions = new DistributedCacheEntryOptions();
            if (sliding > TimeSpan.Zero)
                entryOptions.SlidingExpiration = sliding;
            if (absolute > TimeSpan.Zero)
                entryOptions.AbsoluteExpirationRelativeToNow = absolute;

            return entryOptions;
        }
    }
}
