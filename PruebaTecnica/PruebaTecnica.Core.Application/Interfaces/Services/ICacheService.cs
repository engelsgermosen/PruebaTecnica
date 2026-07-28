using PruebaTecnica.Core.Application.Cache;

namespace PruebaTecnica.Core.Application.Interfaces.Services
{
    public interface ICacheService
    {
        /// <summary>
        /// Cache-aside: devuelve el valor cacheado bajo (group, key) o ejecuta
        /// <paramref name="factory"/>, guarda el resultado y lo devuelve.
        /// Si el backend de cache no esta disponible, ejecuta la factory igualmente.
        /// </summary>
        Task<T> GetOrCreateAsync<T>(
            string group,
            string key,
            Func<CancellationToken, Task<T>> factory,
            CacheEntryOptions? options = null,
            CancellationToken cancellationToken = default);

        /// <summary>Elimina una entrada puntual del grupo.</summary>
        Task RemoveAsync(string group, string key, CancellationToken cancellationToken = default);

        /// <summary>
        /// Invalida TODAS las entradas de un grupo de una vez (paginadas, filtradas,
        /// sin paginacion) incrementando la version del grupo. O(1), sin SCAN.
        /// </summary>
        Task InvalidateGroupAsync(string group, CancellationToken cancellationToken = default);
    }
}
