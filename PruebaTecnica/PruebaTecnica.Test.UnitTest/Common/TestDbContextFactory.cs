using Microsoft.EntityFrameworkCore;
using Moq;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Test.UnitTest.Common
{
    public static class TestDbContextFactory
    {
        public static ApplicationDbContext Create()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())   // BD nueva por test
                .Options;

            // Mock / fake de ICurrentUserService
            var currentUserServiceMock = new Mock<ICurrentUserService>();

            // Ajusta estas propiedades a lo que tenga tu interfaz real
            currentUserServiceMock.Setup(x => x.UserId)
                                  .Returns("test-user");
            // si tiene más cosas, las seteas aquí

            var context = new ApplicationDbContext(
                options,
                currentUserServiceMock.Object
            );

            context.Database.EnsureCreated();
            return context;
        }

        public static void Destroy(ApplicationDbContext context)
        {
            context.Database.EnsureDeleted();
            context.Dispose();
        }
    }
}
