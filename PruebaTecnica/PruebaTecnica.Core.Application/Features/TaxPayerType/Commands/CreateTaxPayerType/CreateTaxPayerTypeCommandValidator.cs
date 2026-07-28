using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.CreateTaxPayerType
{
    public class CreateTaxPayerTypeCommandValidator : AbstractValidator<CreateTaxPayerTypeCommand>
    {
        public CreateTaxPayerTypeCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name es requerido.")
                .MaximumLength(100).WithMessage("Name no debe exceder los 100 caracteres.");
        }
    }
}