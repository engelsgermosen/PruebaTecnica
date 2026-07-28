using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Core.Application.Dtos.Email;
using PruebaTecnica.Core.Application.Interfaces.Services;
using Swashbuckle.AspNetCore.Annotations;

namespace PruebaTecnica.WebApi.Controllers.v1
{
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Email")]
    public class EmailController(IEmailService emailService) : BaseApiController
    {
        private readonly IEmailService _emailService = emailService;

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmailRequest request)
        {
            await _emailService.SendAsync(request);
            return Ok();
        }
    }
}
