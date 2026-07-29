using FluentValidation;

namespace PruebaTecnica.Core.Application.Features.Product.Queries.GetByIdProduct
{
    public class GetByIdProductQueryValidator : AbstractValidator<GetByIdProductQuery>
    {
        public GetByIdProductQueryValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Id debe ser mayor que cero.");
        }
    }
}
