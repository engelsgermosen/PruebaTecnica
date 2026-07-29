using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using NSubstitute;
using PruebaTecnica.Core.Application.Dtos.Auth;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Domain.Settings;
using PruebaTecnica.Infrastructure.Identity.Entities;
using PruebaTecnica.Infrastructure.Identity.Services;

namespace PruebaTecnica.UnitTests.Identity
{
    public class AuthServiceTests
    {
        private const string GenericMessage = "Credenciales inválidas.";

        private static UserManager<ApplicationUser> MockUserManager()
        {
            var store = Substitute.For<IUserStore<ApplicationUser>>();
            return Substitute.For<UserManager<ApplicationUser>>(
                store, null, null, null, null, null, null, null, null);
        }

        private static AuthService BuildService(UserManager<ApplicationUser> userManager)
        {
            var jwt = Options.Create(new JwtSettings
            {
                Key = "clave-super-secreta-de-prueba-con-longitud-suficiente-1234567890",
                Issuer = "test",
                Audience = "test",
                DurationInMinutes = 5,
                RefreshTokenDurationInHours = 1
            });
            return new AuthService(jwt, userManager);
        }

        [Fact]
        public async Task LoginAsync_When_User_Does_Not_Exist_Throws_UnauthorizedException_Generic_Message()
        {
            var userManager = MockUserManager();
            userManager.FindByEmailAsync(Arg.Any<string>()).Returns((ApplicationUser?)null);

            var act = () => BuildService(userManager)
                .LoginAsync(new AuthenticationRequestDto { Email = "nope@x.com", Password = "whatever" });

            var ex = await act.Should().ThrowAsync<UnauthorizedException>();
            ex.Which.Message.Should().Be(GenericMessage);
        }

        [Fact]
        public async Task LoginAsync_When_Password_Wrong_Throws_UnauthorizedException_Generic_Message()
        {
            var userManager = MockUserManager();
            var user = new ApplicationUser { FirstName = "Real", LastName = "User", Email = "real@x.com", UserName = "real" };
            userManager.FindByEmailAsync("real@x.com").Returns(user);
            userManager.CheckPasswordAsync(user, Arg.Any<string>()).Returns(false);

            var act = () => BuildService(userManager)
                .LoginAsync(new AuthenticationRequestDto { Email = "real@x.com", Password = "bad" });

            var ex = await act.Should().ThrowAsync<UnauthorizedException>();
            ex.Which.Message.Should().Be(GenericMessage);
        }

        [Fact]
        public async Task LoginAsync_Should_Not_Distinguish_Between_Missing_User_And_Wrong_Password()
        {
            // Usuario inexistente
            var um1 = MockUserManager();
            um1.FindByEmailAsync(Arg.Any<string>()).Returns((ApplicationUser?)null);
            var missingUser = await Record.ExceptionAsync(() => BuildService(um1)
                .LoginAsync(new AuthenticationRequestDto { Email = "nope@x.com", Password = "x" }));

            // Password incorrecta
            var um2 = MockUserManager();
            var user = new ApplicationUser { FirstName = "Real", LastName = "User", Email = "real@x.com", UserName = "real" };
            um2.FindByEmailAsync("real@x.com").Returns(user);
            um2.CheckPasswordAsync(user, Arg.Any<string>()).Returns(false);
            var wrongPassword = await Record.ExceptionAsync(() => BuildService(um2)
                .LoginAsync(new AuthenticationRequestDto { Email = "real@x.com", Password = "bad" }));

            missingUser.Should().BeOfType<UnauthorizedException>();
            wrongPassword.Should().BeOfType<UnauthorizedException>();
            // Mismo tipo Y mismo mensaje: no filtra que emails estan registrados.
            wrongPassword!.Message.Should().Be(missingUser!.Message);
        }
    }
}
