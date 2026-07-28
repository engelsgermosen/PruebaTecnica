using Microsoft.AspNetCore.Http;
using PruebaTecnica.Core.Application.Interfaces.Services;
using System.Security.Claims;

namespace PruebaTecnica.Infrastructure.Identity.Services
{
    public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}