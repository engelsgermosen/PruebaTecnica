using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.Pagination;
using PruebaTecnica.Core.Application.Dtos.Product;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.Product.Queries.GetAllProduct
{
    public class GetAllProductQuery : IRequest<PagedResponse<ProductDto>>
    {
        public bool? IsActive { get; set; }
        public int? Page { get; set; }
        public int? PageSize { get; set; }
    }

    public class GetAllProductQueryHandler : IRequestHandler<GetAllProductQuery, PagedResponse<ProductDto>>
    {
        private readonly IProductRepository _productRepository;
        private readonly ICacheService _cache;
        private readonly IMapper _mapper;

        public GetAllProductQueryHandler(IProductRepository productRepository, ICacheService cache, IMapper mapper)
        {
            _productRepository = productRepository;
            _cache = cache;
            _mapper = mapper;
        }

        public async Task<PagedResponse<ProductDto>> Handle(GetAllProductQuery request, CancellationToken cancellationToken)
        {
            var paginationKey = request.Page is null || request.PageSize is null || request.PageSize <= 0
                ? "no-page"
                : $"{request.Page}:{request.PageSize}";

            var cacheKey = $"list:{(request.IsActive?.ToString().ToLower() ?? "all")}:{paginationKey}";

            return await _cache.GetOrCreateAsync(CacheGroups.Products, cacheKey,
                ct => QueryProductsAsync(request, ct),
                cancellationToken: cancellationToken);
        }

        private async Task<PagedResponse<ProductDto>> QueryProductsAsync(GetAllProductQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Domain.Entities.Product> query = _productRepository.GetQuery();

            if (request.IsActive is not null)
            {
                var isActive = request.IsActive.Value;
                query = query.Where(x => x.IsActive == isActive);
            }

            var totalItems = await query.CountAsync(cancellationToken);

            List<Domain.Entities.Product> items;
            int currentPage;
            int pageSize;

            // Sin paginacion -> listado completo ordenado por nombre
            if (request.Page is null || request.PageSize is null || request.PageSize <= 0)
            {
                items = await query
                    .OrderBy(x => x.Name)
                    .ToListAsync(cancellationToken);

                currentPage = 1;
                pageSize = items.Count;
            }
            else
            {
                currentPage = request.Page.Value <= 0 ? 1 : request.Page.Value;
                pageSize = request.PageSize.Value <= 0 ? 10 : request.PageSize.Value;

                var skip = (currentPage - 1) * pageSize;

                items = await query
                    .OrderBy(x => x.Name)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync(cancellationToken);
            }

            var dtoList = _mapper.Map<List<ProductDto>>(items);

            return new PagedResponse<ProductDto>
            {
                CurrentPage = currentPage,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = pageSize > 0 ? (int)Math.Ceiling((double)totalItems / pageSize) : 1,
                Items = dtoList
            };
        }
    }
}
