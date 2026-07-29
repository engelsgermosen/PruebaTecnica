using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.Product.Commands.DeleteProduct
{
    public class DeleteProductCommandValidator : AbstractValidator<DeleteProductCommand>
    {
        public DeleteProductCommandValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Id debe ser mayor que cero.");
        }
    }
}
