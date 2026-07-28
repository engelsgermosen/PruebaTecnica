using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.Auth.Commands.Refresh;

public class RefreshCommandValidator : AbstractValidator<RefreshCommand>
{
    public RefreshCommandValidator()
    {
        RuleFor(x => x.Refresh)
            .NotEmpty().WithMessage("{PropertyName} es requerido");
    }
}
