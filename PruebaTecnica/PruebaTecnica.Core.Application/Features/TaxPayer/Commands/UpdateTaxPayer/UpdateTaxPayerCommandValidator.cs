using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Commands.UpdateTaxPayer
{
    public class UpdateTaxPayerCommandValidator : AbstractValidator<UpdateTaxPayerCommand>
    {
        public UpdateTaxPayerCommandValidator()
        {
            RuleFor(x => x.RncIdentification)
                .NotEmpty().WithMessage("RNC o cedula es requerido.")
                .MinimumLength(9).WithMessage("RNC o cedula debe tener al menos 9 caracteres.")
                .MaximumLength(11).WithMessage("RNC o cedula no debe exceder 11 caracteres.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Nombre es requerido.")
                .MaximumLength(100).WithMessage("Nombre no debe exceder 100 caracteres.");

            RuleFor(x => x.TaxPayerTypeId)
                .NotEmpty().WithMessage("TaxPayerTypeId es requerido.").GreaterThan(0).WithMessage("TaxPayerTypeId debe ser mayor que cero");
        }
    }

   
}