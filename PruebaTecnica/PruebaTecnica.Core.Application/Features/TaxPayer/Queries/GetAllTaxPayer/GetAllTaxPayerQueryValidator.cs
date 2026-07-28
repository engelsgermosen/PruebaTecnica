using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetAllTaxPayer;

public class GetAllTaxPayerQueryValidator  : AbstractValidator<GetAllTaxPayerQuery>
{
    public GetAllTaxPayerQueryValidator()
    {
        RuleFor(x => x.RncIdentification)
            .MaximumLength(11).WithMessage("RNC o cedula no puede tener más de 11 caracteres.");
    }
}