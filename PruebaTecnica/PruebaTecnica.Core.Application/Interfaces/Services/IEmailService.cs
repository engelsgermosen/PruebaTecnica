using PruebaTecnica.Core.Application.Dtos.Email;

namespace PruebaTecnica.Core.Application.Interfaces.Services;

public interface IEmailService
{
    Task SendAsync(EmailRequest request);
}
