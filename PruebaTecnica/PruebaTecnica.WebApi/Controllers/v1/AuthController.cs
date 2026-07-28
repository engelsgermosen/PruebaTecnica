using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Core.Application.Dtos.Auth;
using PruebaTecnica.Core.Application.Features.Auth.Commands.Login;
using PruebaTecnica.Core.Application.Features.Auth.Commands.Refresh;
using PruebaTecnica.WebApi.Controllers;
using Swashbuckle.AspNetCore.Annotations;

namespace PruebaTecnica.WebApi.Controllers.v1
{
    [ApiVersion("1.0")]
    [SwaggerTag("Authentication")]
    public class AuthController : BaseApiController
    {
        [HttpPost("login")]
        [SwaggerOperation(summary: "User login",
                          description: "Authenticates a user and returns a JWT token.")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthenticationResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            return Ok(await Mediator.Send(command));
        }


        [HttpPost("refresh")]
        [SwaggerOperation(summary: "User refresh token",
                          description: "a user and returns a JWT token.")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthenticationResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> Refresh([FromBody] RefreshCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

    }
}
