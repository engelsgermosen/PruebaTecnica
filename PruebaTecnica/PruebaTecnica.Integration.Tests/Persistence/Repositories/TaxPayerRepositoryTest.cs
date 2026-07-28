using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Identity.Services;
using PruebaTecnica.Infrastructure.Persistence.Contexts;
using PruebaTecnica.Infrastructure.Persistence.Repositories;

namespace PruebaTecnica.Integration.Tests.Persistence.Repositories
{
    public class TaxPayerRepositoryTest
    {
        private readonly DbContextOptions<ApplicationDbContext> _context;

        public TaxPayerRepositoryTest()
        {
            _context = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDatabase{Guid.NewGuid()}")
                .Options;
        }



        [Fact]
        public async Task GetAllTaxPayers_ShouldReturnAllTaxPayers()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerRepository = new TaxPayerRepository(context);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);

            await taxPayerTypeRepository.AddAsync(
                new TaxPayerType { Id = 1, Name = "Type1" }
            );
            await taxPayerRepository.AddAsync(
                new TaxPayer { Id = "1", Name = "TaxPayer1", TaxPayerTypeId= 1 }
            );
            await taxPayerRepository.AddAsync(
                new TaxPayer { Id = "2", Name = "TaxPayer2", TaxPayerTypeId=1 }
            );
            await taxPayerRepository.AddAsync(
               new TaxPayer { Id = "3", Name = "TaxPayer3", TaxPayerTypeId = 1 }
           );

            // Act
            var result = await taxPayerRepository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3);
        }

        [Fact]
        public async Task GetAllTaxPayers_WhenIsEmpty_ShouldReturnNull()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayersRepository = new TaxPayerRepository(context);

            // Act
            var result = await taxPayersRepository.GetAllAsync();

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task AddAsync_Should_Add_TaxPayer_To_Database()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerRepository = new TaxPayerRepository(context);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);

            await taxPayerTypeRepository.AddAsync(
                new TaxPayerType { Id = 1, Name = "Type1" }
            );
            var taxPayer = new TaxPayer { Id = "1", Name = "TaxPayer1", TaxPayerTypeId=1 };

            // Act
            var result = await taxPayerRepository.AddAsync(taxPayer);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("1");
            result.Name.Should().Be("TaxPayer1");
        }

        [Fact]
        public async Task AddAsync_Should_Throw_When_Null()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerRepository = new TaxPayerRepository(context);
            // Act

            Func<Task> act = async () => await taxPayerRepository.AddAsync(null!);


            // Assert
            await act.Should().ThrowAsync<ArgumentNullException>()
                .WithMessage("Value cannot be null. (Parameter 'entity')");
        }


        [Fact]
        public async Task GetById_Should_Return_TaxPayer_When_Exists()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var taxPayerRepository = new TaxPayerRepository(context);
            await taxPayerTypeRepository.AddAsync(
                new TaxPayerType { Id = 1, Name = "Type1" }
            );
            var taxPayer = new TaxPayer { Id = "1", Name = "TaxPayer1", TaxPayerTypeId=1 };
            await taxPayerRepository.AddAsync(taxPayer);

            // Act
            var result = await taxPayerRepository.GetByIdAsync("1");

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("1");
            result.Name.Should().Be("TaxPayer1");
        }

        [Fact]
        public async Task GetById_Should_Return_TaxPayerType_When_NotExists()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerRepository = new TaxPayerRepository(context);

            // Act
            var result = await taxPayerRepository.GetByIdAsync("1");

            // Assert
            result.Should().BeNull();

        }


        [Fact]
        public async Task UpdateAsync_Should_Modify_Existing_TaxPayer_In_Database()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var taxPayerRepository = new TaxPayerRepository(context);

            await taxPayerTypeRepository.AddAsync(
                new TaxPayerType { Id = 1, Name = "Type1" }
            );
            var taxPayer = new TaxPayer { Id = "1", Name = "TaxPayer1", TaxPayerTypeId=1 };
            await taxPayerRepository.AddAsync(taxPayer);

            // Act
            taxPayer.Name = "UpdatedTaxPayer1";
            var result = await taxPayerRepository.UpdateAsync(taxPayer, "1");

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("1");
            result.Name.Should().Be("UpdatedTaxPayer1");
        }

        [Fact]
        public async Task UpdateAsync_Should_Return_Throw_When_TaxPayer_Not_Found()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerRepository = new TaxPayerRepository(context);
            var fakeTaxPayer = new TaxPayer { Id = "1", Name = "TaxPayer1", TaxPayerTypeId=1 };
            // Act

            Func<Task> act = async () => await taxPayerRepository.UpdateAsync(fakeTaxPayer, fakeTaxPayer.Id);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Entidad con id '1' no encontrada.");
        }


        [Fact]
        public async Task DeleteAsync_Should_Remove_TaxPayer_When_Exists()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var taxPayerRepository = new TaxPayerRepository(context);

            await taxPayerTypeRepository.AddAsync(new TaxPayerType { Id = 1, Name = "Type1" });
            var taxPayer = new TaxPayer { Id = "1", Name = "TaxPayer1", TaxPayerTypeId=1 };
            await taxPayerRepository.AddAsync(taxPayer);
            // Act

            await taxPayerRepository.DeleteAsync(taxPayer);
            var result = await taxPayerRepository.GetByIdAsync(taxPayer.Id);

            // Assert
            result.Should().BeNull();
        }


        [Fact]
        public async Task DeleteAsync_Should_Return_Throw_When_TaxPayer_Not_Found()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerRepository = new TaxPayerRepository(context);
            var taxPayer = new TaxPayer { Id = "1", Name = "TaxPayer" };
            // Act

            Func<Task> act = async () => await taxPayerRepository.DeleteAsync(taxPayer);
            var result = await taxPayerRepository.GetByIdAsync(taxPayer.Id);

            // Assert
            result.Should().BeNull();
            await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
        }
    }
}
