using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Commands.DeleteTaxPayer
{
    public class DeleteTaxPayerCommandValidator : AbstractValidator<DeleteTaxPayerCommand>
    {
        public DeleteTaxPayerCommandValidator()
        {
            RuleFor(x => x.RncIdentification)
                .NotNull().WithMessage("Rnc o cedula es requerido.")
                .MaximumLength(11).WithMessage("Rnc o cedula no debe exceder los 11 caracteres.")
                .MinimumLength(9).WithMessage("Rnc o cedula debe tener al menos 9 caracteres.");
        }
    }
}