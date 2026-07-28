using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Queries.GetByIdTaxPayerType
{
    public class GetByIdTaxPayerTypeQueryValidator : AbstractValidator<GetByIdTaxPayerTypeQuery>
    {
        public GetByIdTaxPayerTypeQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotNull()
                .WithMessage("Id es requerido.")
                .GreaterThan(0)
                .WithMessage("Id debe ser mayor que cero.");
        }
    }
}