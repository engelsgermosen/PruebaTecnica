using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using PruebaTecnica.Core.Application.Dtos.Email;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Settings;

namespace PruebaTecnica.Infrastructure.Shared.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }
        public async Task SendAsync(EmailRequest request)
        {
            try
            {
                MimeMessage email = new();
                email.To.Add(MailboxAddress.Parse(request.To));
                email.Sender = MailboxAddress.Parse(_settings.SmtpUser);
                email.Subject = request.Subject;

                BodyBuilder bodyBuilder = new();
                bodyBuilder.HtmlBody = request.HtmlBody;
                email.Body = bodyBuilder.ToMessageBody();

                using (var smtp = new SmtpClient())
                {
                    await smtp.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
                    await smtp.AuthenticateAsync(_settings.SmtpUser, _settings.SmtpPass);
                    var response = await smtp.SendAsync(email);
                    Console.WriteLine(response.ToString());
                    await smtp.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                Console.BackgroundColor = ConsoleColor.Red;
                Console.WriteLine(ex.ToString());
                Console.ResetColor();
            }
        }
    }
}
