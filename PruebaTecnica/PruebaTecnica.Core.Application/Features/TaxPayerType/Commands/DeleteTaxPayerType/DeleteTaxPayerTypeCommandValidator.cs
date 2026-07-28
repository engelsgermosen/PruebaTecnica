using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.DeleteTaxPayerType
{
    public class DeleteTaxPayerTypeCommandValidator : AbstractValidator<DeleteTaxPayerTypeCommand>
    {
        public DeleteTaxPayerTypeCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotNull()
                .WithMessage("Tipo de contribuyente Id es requerido.")
                .GreaterThan(0)
                .WithMessage("Tipo de contribuyente Id debe ser mayor que cero.");
        }
    }
}