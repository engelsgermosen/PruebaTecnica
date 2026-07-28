namespace PruebaTecnica.Core.Domain.Settings
{
    public class CacheSettings
    {
        public bool Enabled { get; set; } = true;

        public string? RedisConnection { get; set; }

        /// <summary>Prefijo de todas las claves en Redis (aisla esta app en un Redis compartido).</summary>
        public string InstanceName { get; set; } = "PruebaTecnica:";

        public int DefaultSlidingExpirationMinutes { get; set; } = 5;

        /// <summary>
        /// Tope absoluto de vida de una entrada. Ademas de frescura, acota el dano si
        /// se pierde una invalidacion (p. ej. Redis caido justo al escribir).
        /// </summary>
        public int DefaultAbsoluteExpirationMinutes { get; set; } = 30;
    }
}
