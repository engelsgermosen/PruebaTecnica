using AutoMapper;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.CreateTaxPayerType;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Mapping;
using PruebaTecnica.Infrastructure.Identity.Services;
using PruebaTecnica.Infrastructure.Persistence.Contexts;
using PruebaTecnica.Infrastructure.Persistence.Repositories;

namespace PruebaTecnica.Unit.Tests.Features.TaxPayerType
{
    public class CreateTaxPayerTypeCommandHandlerTests
    {

        private readonly DbContextOptions<ApplicationDbContext> _dbContextOptions;
        private readonly IMapper _mapper;
        private readonly ILoggerFactory _loggerFactory;
        private static Profile GeneralProfile() => new GeneralProfile();
        public CreateTaxPayerTypeCommandHandlerTests()
        {
            _dbContextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"InMemoryDb-{Guid.NewGuid()}")
                .Options;
            _loggerFactory = new LoggerFactory();
            var config = new MapperConfiguration(cfg => cfg.AddProfile(GeneralProfile()), _loggerFactory);
            _mapper = config.CreateMapper();
        }

        [Fact]
        public async Task Handle_Should_Create_TaxPayerType_Successfully()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(http);
            var context = new ApplicationDbContext(_dbContextOptions, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
     
            var handler = new CreateTaxPayerTypeCommandHandler(taxPayerTypeRepository, _mapper);
            var command = new CreateTaxPayerTypeCommand
            {
                Name = "Individual",
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);
            // Assert
            result.Should().NotBeNull();
            result.Name.Should().Be("Individual");
            var taxPayerTypeInDb = await context.TaxPayerTypes.FindAsync(result.Id);
            taxPayerTypeInDb.Should().NotBeNull();
            taxPayerTypeInDb.Name.Should().Be("Individual");
        }


        [Fact]
        public async Task Handle_ShouldReturnZero_WhenRepositoryReturnsNull()
        {
            // Arrange

            Mock<ITaxPayerTypeRepository> mockRepo = new();
            var handler = new CreateTaxPayerTypeCommandHandler(mockRepo.Object, _mapper);
            var command = new CreateTaxPayerTypeCommand
            {
                Name = "Individual",
            };

            // GetQuery debe devolver un IQueryable con soporte async (el handler usa FirstOrDefaultAsync)
            mockRepo
                .Setup(r => r.GetQuery())
                .Returns(new Common.TestAsyncEnumerable<Core.Domain.Entities.TaxPayerType>(
                    Enumerable.Empty<Core.Domain.Entities.TaxPayerType>()));

            mockRepo
                .Setup(r => r.AddAsync(It.IsAny<Core.Domain.Entities.TaxPayerType>()))
                .ReturnsAsync((Core.Domain.Entities.TaxPayerType?)null!);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeNull();
            mockRepo.Verify(r => r.AddAsync(It.IsAny<Core.Domain.Entities.TaxPayerType>()), Times.Once);
        }
    }
}
