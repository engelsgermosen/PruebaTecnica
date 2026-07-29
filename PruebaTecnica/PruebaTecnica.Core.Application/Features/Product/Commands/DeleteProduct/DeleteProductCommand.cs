using AutoMapper;
using MediatR;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.Product;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.Product.Commands.DeleteProduct
{
    public class DeleteProductCommand : IRequest<ProductDto>
    {
        public int Id { get; set; }
    }

    public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, ProductDto>
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;

        public DeleteProductCommandHandler(IProductRepository productRepository, IMapper mapper, ICacheService cache)
        {
            _productRepository = productRepository;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ProductDto> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdAsync(request.Id);
            if (product == null)
            {
                throw new ApiException($"Producto con id {request.Id} no encontrado.", 404);
            }

            // Soft delete: no se borra fisicamente para no romper la FK Restrict de los detalles.
            product.IsActive = false;
            var updated = await _productRepository.UpdateAsync(product, request.Id);
            await _cache.InvalidateGroupAsync(CacheGroups.Products, cancellationToken);
            return _mapper.Map<ProductDto>(updated);
        }
    }
}
