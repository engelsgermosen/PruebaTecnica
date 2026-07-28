using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetAllTaxReceiptByTaxPayer
{
    public class GetAllTaxReceiptByTaxPayerQueryValidator  : AbstractValidator<GetAllTaxReceiptByTaxPayerQuery>
    {
        public GetAllTaxReceiptByTaxPayerQueryValidator()
        {
            RuleFor(x => x.RncIdentification)
               .NotEmpty().WithMessage("RNC o Cedula es requerido.")
                .MinimumLength(9).WithMessage("RNC o Cedula debe tener al menos 9 caracteres.")
               .MaximumLength(11).WithMessage("RNC o Cedula no debe exceder 11 caracteres.");
        }
    }
    
}
