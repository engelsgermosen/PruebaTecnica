using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Identity.Services;
using PruebaTecnica.Infrastructure.Persistence.Contexts;
using PruebaTecnica.Infrastructure.Persistence.Repositories;

namespace PruebaTecnica.Integration.Tests.Persistence.Repositories
{
    public class TaxPayerTypeRepositoryTest
    {
        private readonly DbContextOptions<ApplicationDbContext> _context;

        public TaxPayerTypeRepositoryTest()
        {
            _context = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDatabase{Guid.NewGuid()}")
                .Options;
        }

        [Fact]
        public async Task GetAllTaxPayerTypes_ShouldReturnAllTaxPayerTypes()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context,currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            await taxPayerTypeRepository.AddAsync(
                new TaxPayerType { Id = 1, Name = "Type1" }
            );
            await taxPayerTypeRepository.AddAsync(
                new TaxPayerType { Id = 2, Name = "Type2" }
            );

            // Act
            var result = await taxPayerTypeRepository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetAllTaxPayerType_WhenIsEmpty_ShouldReturnNull()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);

            // Act
            var result = await taxPayerTypeRepository.GetAllAsync();

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task AddAsync_Should_Add_TaxPayerType_To_Database()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var taxPayerType = new TaxPayerType { Id = 1, Name = "Type1" };

            // Act
            var result = await taxPayerTypeRepository.AddAsync(taxPayerType);
             
            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(1);
            result.Name.Should().Be("Type1");
        }

        [Fact]
        public async Task AddAsync_Should_Throw_When_Null()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            // Act
                
            Func<Task> act = async () => await taxPayerTypeRepository.AddAsync(null!);


            // Assert
            await act.Should().ThrowAsync<ArgumentNullException>()
                .WithMessage("Value cannot be null. (Parameter 'entity')");
        }


        [Fact]
        public async Task GetById_Should_Return_TaxPayerType_When_Exists()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var taxPayerType = new TaxPayerType { Id = 1, Name = "Type1" };
            await taxPayerTypeRepository.AddAsync(taxPayerType);

            // Act
            var result = await taxPayerTypeRepository.GetByIdAsync(1);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(1);
            result.Name.Should().Be("Type1");
        }

        [Fact]
        public async Task GetById_Should_Return_TaxPayerType_When_NotExists()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);

            // Act
            var result = await taxPayerTypeRepository.GetByIdAsync(1);

            // Assert
            result.Should().BeNull();

        }


        [Fact]
        public async Task UpdateAsync_Should_Modify_Existing_TaxPayerType_In_Database()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var taxPayerType = new TaxPayerType { Id = 1, Name = "Type1" };
            await taxPayerTypeRepository.AddAsync(taxPayerType);

            // Act
            taxPayerType.Name = "UpdatedType1";
            var result = await taxPayerTypeRepository.UpdateAsync(taxPayerType, 1);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(1);
            result.Name.Should().Be("UpdatedType1");
        }

        [Fact]
        public async Task UpdateAsync_Should_Return_Throw_When_TaxPayerType_Not_Found()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var fakeTaxPayerType = new TaxPayerType { Id = 1, Name = "Type1" };
            // Act

           Func<Task> act = async () => await taxPayerTypeRepository.UpdateAsync(fakeTaxPayerType, fakeTaxPayerType.Id);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Entidad con id '1' no encontrada.");
        }


        [Fact]
        public async Task DeleteAsync_Should_Remove_TaxPayerType_When_Exists()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var taxPayerType = new TaxPayerType { Id = 1, Name = "Type1" };
            await taxPayerTypeRepository.AddAsync(taxPayerType);
            // Act

            await taxPayerTypeRepository.DeleteAsync(taxPayerType);
            var result = await taxPayerTypeRepository.GetByIdAsync(taxPayerType.Id);

            // Assert
            result.Should().BeNull();
        }


        [Fact]
        public async Task DeleteAsync_Should_Return_Throw_When_TaxPayerType_Not_Found()
        {
            // Arrange
            var http = new HttpContextAccessor();
            var currentUserService = new CurrentUserService(httpContextAccessor: http);
            using var context = new ApplicationDbContext(_context, currentUserService);
            var taxPayerTypeRepository = new TaxPayerTypeRepository(context);
            var taxPayerType = new TaxPayerType { Id = 1, Name = "Type1" };
            // Act

            Func<Task> act = async () => await taxPayerTypeRepository.DeleteAsync(taxPayerType);
            var result = await taxPayerTypeRepository.GetByIdAsync(taxPayerType.Id);

            // Assert
            result.Should().BeNull();
            await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
        }
    }
}
