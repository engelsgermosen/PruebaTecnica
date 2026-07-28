namespace PruebaTecnica.Core.Application.Dtos.Auth
{
    public class AuthenticationRequestDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
