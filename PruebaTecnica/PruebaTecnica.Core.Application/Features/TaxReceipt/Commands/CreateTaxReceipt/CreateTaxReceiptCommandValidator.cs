using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.TaxReceipt.Commands.CreateTaxReceipt
{
    public class CreateTaxReceiptCommandValidator : AbstractValidator<CreateTaxReceiptCommand>
    {
        public CreateTaxReceiptCommandValidator()
        {
            RuleFor(x => x.TaxReceiptTypeId)
                .IsInEnum().WithMessage("Tipo de comprobante invalido.");

            RuleFor(x => x.RncIdentification)
                .NotEmpty().WithMessage("RNC o cedula es requerido.")
                .MinimumLength(9).WithMessage("RNC o cedula debe tener al menos 9 caracteres.")
                .MaximumLength(11).WithMessage("RNC o cedula no debe exceder los 11 caracteres.");

            RuleFor(x => x.Details)
                .NotEmpty().WithMessage("Debe incluir al menos una linea de detalle.");

            RuleForEach(x => x.Details).ChildRules(detail =>
            {
                detail.RuleFor(d => d.ProductId)
                    .GreaterThan(0).WithMessage("ProductId debe ser mayor que cero.");
                detail.RuleFor(d => d.Quantity)
                    .GreaterThan(0).WithMessage("Quantity debe ser mayor que cero.");
            });
        }
    }
}
