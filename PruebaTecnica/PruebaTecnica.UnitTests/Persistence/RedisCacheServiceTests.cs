using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NSubstitute;
using PruebaTecnica.Core.Domain.Settings;
using PruebaTecnica.Infrastructure.Persistence.Services;

namespace PruebaTecnica.UnitTests.Persistence
{
    public class RedisCacheServiceTests
    {
        private readonly IDistributedCache _cache = Substitute.For<IDistributedCache>();
        private readonly ILogger<RedisCacheService> _logger = Substitute.For<ILogger<RedisCacheService>>();

        private RedisCacheService Build(bool enabled = true)
        {
            var settings = Options.Create(new CacheSettings
            {
                Enabled = enabled,
                DefaultSlidingExpirationMinutes = 5,
                DefaultAbsoluteExpirationMinutes = 30
            });
            return new RedisCacheService(_cache, settings, _logger);
        }

        [Fact]
        public async Task GetOrCreateAsync_When_Redis_Unavailable_Returns_Factory_Result_And_Logs_Warning()
        {
            // Redis caido: cualquier lectura lanza.
            _cache.GetAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                  .Returns<Task<byte[]?>>(_ => throw new InvalidOperationException("redis down"));

            var factoryCalled = false;

            var result = await Build().GetOrCreateAsync("products", "list:all", _ =>
            {
                factoryCalled = true;
                return Task.FromResult("from-source");
            });

            factoryCalled.Should().BeTrue();
            result.Should().Be("from-source");

            // Logueo un warning, sin propagar la excepcion.
            _logger.ReceivedCalls()
                   .SelectMany(c => c.GetArguments())
                   .OfType<LogLevel>()
                   .Should().Contain(LogLevel.Warning);
        }

        [Fact]
        public async Task GetOrCreateAsync_When_Cache_Disabled_Calls_Factory_Without_Touching_Cache()
        {
            var result = await Build(enabled: false).GetOrCreateAsync("products", "list:all",
                _ => Task.FromResult("from-source"));

            result.Should().Be("from-source");
            await _cache.DidNotReceive().GetAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        }
    }
}
