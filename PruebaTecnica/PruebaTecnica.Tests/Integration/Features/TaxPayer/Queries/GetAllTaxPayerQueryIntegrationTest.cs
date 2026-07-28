
using AutoMapper;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetAllTaxPayer;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Application.Mapping;
using PruebaTecnica.Core.Domain.Settings;
using PruebaTecnica.Infrastructure.Identity.Services;
using PruebaTecnica.Infrastructure.Persistence.Contexts;
using PruebaTecnica.Infrastructure.Persistence.Repositories;
using PruebaTecnica.Infrastructure.Persistence.Services;

namespace PruebaTecnica.Tests.Integration.Features.TaxPayer.Queries
{
    public class GetAllTaxPayerQueryIntegrationTest
    {
        private readonly ApplicationDbContext _context;
        private readonly TaxPayerRepository _repo;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;
        private readonly GetAllTaxPayerQueryHandler _handler;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILoggerFactory _loggerFactory;

        public GetAllTaxPayerQueryIntegrationTest()
        {
            _loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            // AutoMapper real
            var mapperConfig = new MapperConfiguration(cfg => {
                cfg.AddProfile(new GeneralProfile());

            },_loggerFactory);

            _mapper = mapperConfig.CreateMapper();

            // EF Core InMemory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var http = new HttpContextAccessor();
            _currentUserService = new CurrentUserService(http);
            _context = new ApplicationDbContext(options, _currentUserService);
            _repo = new TaxPayerRepository(_context);

            // Cache real (RedisCacheService) sobre un IDistributedCache en memoria
            var distributedCache = new MemoryDistributedCache(
                Options.Create(new MemoryDistributedCacheOptions()));
            _cacheService = new RedisCacheService(
                distributedCache,
                Options.Create(new CacheSettings()),
                NullLogger<RedisCacheService>.Instance);

            // Handler real
            _handler = new GetAllTaxPayerQueryHandler(_mapper, _repo, _cacheService);
        }

        [Fact]
        public async Task Should_Get_All_TaxPayers_With_Pagination()
        {
            // Arrange: Insertar datos
            _context.TaxPayers.Add(new Core.Domain.Entities.TaxPayer
            {
                Id = "123",
                Name = "Juan Perez"
            });

            _context.TaxPayers.Add(new Core.Domain.Entities.TaxPayer
            {
                Id = "124",
                Name = "Maria Gomez"
            });

            await _context.SaveChangesAsync();

            var query = new GetAllTaxPayerQuery
            {
                Page = 1,
                PageSize = 10
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Items.Should().HaveCount(2);

            result.Items.First().Name.Should().Be("Juan Perez");
            result.Items.Last().Name.Should().Be("Maria Gomez");
        }

        [Fact]
        public async Task Should_Serve_From_Cache_And_Refresh_After_Group_Invalidation()
        {
            // Arrange
            _context.TaxPayers.Add(new Core.Domain.Entities.TaxPayer { Id = "123", Name = "Juan Perez" });
            _context.TaxPayers.Add(new Core.Domain.Entities.TaxPayer { Id = "124", Name = "Maria Gomez" });
            await _context.SaveChangesAsync();

            var query = new GetAllTaxPayerQuery { Page = 1, PageSize = 10 };

            // Act: primera consulta llena el cache
            var first = await _handler.Handle(query, CancellationToken.None);
            first.Items.Should().HaveCount(2);

            // Se agrega un tercer contribuyente directo a la BD (el cache no se entera)
            _context.TaxPayers.Add(new Core.Domain.Entities.TaxPayer { Id = "125", Name = "Pedro Sosa" });
            await _context.SaveChangesAsync();

            // Assert: la segunda consulta sale del cache (sigue viendo 2)
            var cached = await _handler.Handle(query, CancellationToken.None);
            cached.Items.Should().HaveCount(2, "la respuesta debe venir del cache");

            // Al invalidar el grupo, la siguiente consulta vuelve a la BD (ve 3)
            await _cacheService.InvalidateGroupAsync(CacheGroups.TaxPayers);
            var refreshed = await _handler.Handle(query, CancellationToken.None);
            refreshed.Items.Should().HaveCount(3, "la invalidacion del grupo debe descartar lo cacheado");
        }

        [Fact]
        public async Task Should_Filter_By_RncIdentification()
        {
            // Arrange
            _context.TaxPayers.Add(new Core.Domain.Entities.TaxPayer
            {
                Id = "555",
                Name = "User Filter"
            });

            _context.TaxPayers.Add(new Core.Domain.Entities.TaxPayer
            {
                Id = "999",
                Name = "Other"
            });

            await _context.SaveChangesAsync();

            var query = new GetAllTaxPayerQuery
            {
                RncIdentification = "555",
                Page = 1,
                PageSize = 5
            };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            result.Items.Should().HaveCount(1);
            result.Items.First().RncIdentification.Should().Be("555");
        }
    }
}
