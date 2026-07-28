using PruebaTecnica.Core.Application.Dtos.Auth;

namespace PruebaTecnica.Core.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<AuthenticationResponseDto> LoginAsync(AuthenticationRequestDto request);

        Task<AuthenticationResponseDto> RefreshAsync(string refresh);

    }
}
