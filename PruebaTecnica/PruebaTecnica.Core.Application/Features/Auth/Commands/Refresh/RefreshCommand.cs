using MediatR;
using PruebaTecnica.Core.Application.Dtos.Auth;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.Auth.Commands.Refresh
{
    public class RefreshCommand : IRequest<AuthenticationResponseDto>
    {
        public string? Refresh {  get; set; }
    }

    public class RefreshCommandHandler : IRequestHandler<RefreshCommand, AuthenticationResponseDto>
    {
        private readonly IAuthService _authService;

        public RefreshCommandHandler(IAuthService authService)
        {
            _authService = authService;
        }
        public async Task<AuthenticationResponseDto> Handle(RefreshCommand request, CancellationToken cancellationToken)
        {
            return await _authService.RefreshAsync(request.Refresh ?? "");
        }
    }
}
