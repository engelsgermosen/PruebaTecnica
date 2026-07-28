using AutoMapper;
using MediatR;
using PruebaTecnica.Core.Application.Dtos.Auth;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.Auth.Commands.Login
{
    public class LoginCommand : IRequest<AuthenticationResponseDto>
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class LoginCommandHandler(IAuthService authService, IMapper mapper) : IRequestHandler<LoginCommand, AuthenticationResponseDto>
    {
        private readonly IAuthService _authService = authService;
        private readonly IMapper _mapper = mapper;
        public async Task<AuthenticationResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            return await _authService.LoginAsync(_mapper.Map<AuthenticationRequestDto>(request));
        }
    }
}
