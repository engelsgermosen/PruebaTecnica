namespace PruebaTecnica.Core.Application.Dtos.Email;

public class EmailRequest
{
    public required string To { get; set; }

    public required string Subject { get; set; }

    public required string HtmlBody { get; set; }
}
