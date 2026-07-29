using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.Product;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.Product.Commands.CreateProduct
{
    public class CreateProductCommand : IRequest<ProductDto>
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;

        public CreateProductCommandHandler(IProductRepository productRepository, IMapper mapper, ICacheService cache)
        {
            _productRepository = productRepository;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            var existing = await _productRepository.GetQuery()
                .FirstOrDefaultAsync(p => p.Name.ToLower() == request.Name!.ToLower(), cancellationToken);

            if (existing != null)
            {
                throw new ApiException($"Ya existe un producto con el nombre '{request.Name}'.", 409);
            }

            var product = _mapper.Map<Domain.Entities.Product>(request);
            var created = await _productRepository.AddAsync(product);
            await _cache.InvalidateGroupAsync(CacheGroups.Products, cancellationToken);
            return _mapper.Map<ProductDto>(created);
        }
    }
}
