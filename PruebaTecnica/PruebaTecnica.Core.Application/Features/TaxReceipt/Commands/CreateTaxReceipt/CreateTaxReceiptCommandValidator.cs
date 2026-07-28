using FluentValidation;
using PruebaTecnica.Core.Domain.Enums;

namespace PruebaTecnica.Core.Application.Features.TaxReceipt.Commands.CreateTaxReceipt
{
    public class CreateTaxReceiptCommandValidator : AbstractValidator<CreateTaxReceiptCommand>
    {
        public CreateTaxReceiptCommandValidator()
        {
            RuleFor(x => x.Amount)
                .NotEmpty().WithMessage("Amount es requerido.")
                .GreaterThan(0).WithMessage("Amount debe ser mayor que cero.");

            RuleFor(x => x.RncIdentification)
                .NotEmpty().WithMessage("RNC o cedula es requerido.")
                .MinimumLength(9).WithMessage("RNC o cedula debe tener al menos 9 caracteres.")
                .MaximumLength(11).WithMessage("RNC o cedula debe tener 11 caracteres.");

            RuleFor(x => x.Type)
                .IsInEnum()
                .WithMessage("Tipo de comprobante invalido.");

            RuleFor(x => (int)x.Type)
                .InclusiveBetween(1, 19)
                .WithMessage("El tipo debe estar entre 1 y 19.");
        }
    }
}
