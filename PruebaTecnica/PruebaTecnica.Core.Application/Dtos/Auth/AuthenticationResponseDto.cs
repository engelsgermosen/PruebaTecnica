using PruebaTecnica.Core.Application.Dtos.User;

namespace PruebaTecnica.Core.Application.Dtos.Auth
{
    public class AuthenticationResponseDto
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }

        public UserDto? User { get; set; } = null;
    }
}
