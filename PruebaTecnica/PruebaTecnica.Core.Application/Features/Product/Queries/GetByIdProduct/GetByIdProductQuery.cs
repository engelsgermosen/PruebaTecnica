using AutoMapper;
using MediatR;
using PruebaTecnica.Core.Application.Dtos.Product;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.Product.Queries.GetByIdProduct
{
    public class GetByIdProductQuery : IRequest<ProductDto>
    {
        public int Id { get; set; }
    }

    public class GetByIdProductQueryHandler : IRequestHandler<GetByIdProductQuery, ProductDto>
    {
        private readonly IMapper _mapper;
        private readonly IProductRepository _productRepository;

        public GetByIdProductQueryHandler(IMapper mapper, IProductRepository productRepository)
        {
            _mapper = mapper;
            _productRepository = productRepository;
        }

        public async Task<ProductDto> Handle(GetByIdProductQuery request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdAsync(request.Id);

            if (product == null)
            {
                throw new ApiException($"Producto con id {request.Id} no encontrado.", 404);
            }

            return _mapper.Map<ProductDto>(product);
        }
    }
}
