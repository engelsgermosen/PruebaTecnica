using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PruebaTecnica.Core.Application.Dtos.Auth;
using PruebaTecnica.Core.Application.Dtos.User;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Settings;
using PruebaTecnica.Infrastructure.Identity.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PruebaTecnica.Infrastructure.Identity.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtSettings _jwtSettings;
        public AuthService(IOptions<JwtSettings> jwtSettings, UserManager<ApplicationUser> userManager)
        {
            _jwtSettings = jwtSettings.Value;
            _userManager = userManager;
        }
        public async Task<AuthenticationResponseDto> LoginAsync(AuthenticationRequestDto request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);


            if (user == null)
            {
                throw new ApiException("Credenciales inválidas.", 401);
            }

            var result = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!result)
            {
                throw new ApiException("Credenciales inválidas.", 401);
            }

            if (!user.EmailConfirmed)
            {
                throw new ApiException("Email no confirmado.", 403);
            }

            // Generate JWT token
            var token = await GenerateJwtToken(user);
            var refreshToken = GenerateRefreshTokenAsync(user);
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiresAt = DateTime.Now.AddHours(_jwtSettings.RefreshTokenDurationInHours);

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                throw new ApiException("No se pudo iniciar la sesion. Intente de nuevo.", 500);

            return new AuthenticationResponseDto
            {
                AccessToken = token,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    FullName = $"{user.FirstName} {user.LastName}",
                    Email = user?.Email,
                    UserName = user?.UserName
                }
            };
        }

        public async Task<AuthenticationResponseDto> RefreshAsync(string refresh)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.RefreshToken ==  refresh);

            if (user == null) throw new ApiException("Refresh token invalido", 401);

            if(!user.RefreshTokenExpiresAt.HasValue || user.RefreshTokenExpiresAt <= DateTime.Now)
                throw new ApiException("Refresh token expired", 401);


            var newToken = await GenerateJwtToken(user);
            var newRefresh = GenerateRefreshTokenAsync(user);

            user.RefreshToken = newRefresh;
            user.RefreshTokenExpiresAt = DateTime.Now.AddHours(_jwtSettings.RefreshTokenDurationInHours);

            // Si otro request roto el token primero (ConcurrencyStamp), este refresh pierde:
            // se reporta como token invalido en vez de devolver un token nunca persistido.
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                throw new ApiException("Refresh token invalido", 401);

            return new AuthenticationResponseDto
            {
                AccessToken = newToken,
                RefreshToken = newRefresh,
                User = new UserDto
                {
                    FullName = $"{user.FirstName} {user.LastName}",
                    Email = user?.Email,
                    UserName = user?.UserName
                }
            };
        }


        #region Private Methods

        public async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var userClaims = await _userManager.GetClaimsAsync(user);
            var roles = await _userManager.GetRolesAsync(user);

            List<Claim> userRoles = new();

            foreach(string role in roles)
            {
                userRoles.Add(new Claim("role", role));
            }

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            }
            .Union(userRoles)
            .Union(userClaims);

            var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            var signingCredentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(_jwtSettings.DurationInMinutes),
                signingCredentials: signingCredentials
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshTokenAsync(ApplicationUser user)
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

       

        #endregion
    }
}
