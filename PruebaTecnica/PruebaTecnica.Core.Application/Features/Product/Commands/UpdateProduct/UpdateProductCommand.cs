using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.Product;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.Product.Commands.UpdateProduct
{
    public class UpdateProductCommand : IRequest<ProductDto>
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDto>
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;

        public UpdateProductCommandHandler(IProductRepository productRepository, IMapper mapper, ICacheService cache)
        {
            _productRepository = productRepository;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ProductDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            var existing = await _productRepository.GetByIdAsync(request.Id);
            if (existing == null)
            {
                throw new ApiException($"Producto con id {request.Id} no encontrado.", 404);
            }

            var duplicated = await _productRepository.GetQuery()
                .FirstOrDefaultAsync(p => p.Id != request.Id && p.Name.ToLower() == request.Name!.ToLower(), cancellationToken);

            if (duplicated != null)
            {
                throw new ApiException($"Ya existe un producto con el nombre '{request.Name}'.", 409);
            }

            var product = _mapper.Map<Domain.Entities.Product>(request);
            var updated = await _productRepository.UpdateAsync(product, request.Id);
            await _cache.InvalidateGroupAsync(CacheGroups.Products, cancellationToken);
            return _mapper.Map<ProductDto>(updated);
        }
    }
}
