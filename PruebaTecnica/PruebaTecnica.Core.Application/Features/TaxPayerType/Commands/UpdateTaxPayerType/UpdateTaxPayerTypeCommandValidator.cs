using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.UpdateTaxPayerType
{
    public class UpdateTaxPayerTypeCommandValidator : AbstractValidator<UpdateTaxPayerTypeCommand>
    {
        public UpdateTaxPayerTypeCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotNull()
                .WithMessage("Tipo de contribuyente Id es requerido.")
                .GreaterThan(0)
                .WithMessage("Tipo de contribuyente Id debe ser mayor que cero.");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tipo de contribuyente Nombre es requerido.")
                .MaximumLength(100)
                .WithMessage("Tipo de contribuyente Nombre no debe exceder los 100 caracteres.");
        }
    }

   
}