using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.Product.Commands.CreateProduct
{
    public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name es requerido.")
                .MaximumLength(150).WithMessage("Name no debe exceder los 150 caracteres.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description no debe exceder los 500 caracteres.");

            RuleFor(x => x.UnitPrice)
                .GreaterThan(0).WithMessage("UnitPrice debe ser mayor que cero.");
        }
    }
}
