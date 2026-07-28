using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetByIdTaxPayer
{
    public class GetByIdTaxPayerQueryValidator : AbstractValidator<GetByIdTaxPayerQuery>
    {
        public GetByIdTaxPayerQueryValidator()
        {
            RuleFor(x => x.RncIdentification)
                .NotEmpty().WithMessage("RNC o Cedula es requerido.")
                .MinimumLength(9).WithMessage("RNC o Cedula debe tener al menos 9 caracteres.")
                .MaximumLength(11).WithMessage("RNC o Cedula no debe exceder 11 caracteres.");
        }
    }
}