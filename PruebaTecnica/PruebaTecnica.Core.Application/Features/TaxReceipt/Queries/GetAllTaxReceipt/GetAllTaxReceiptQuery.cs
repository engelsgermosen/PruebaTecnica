using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.Pagination;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.TaxReceipt.Queries.GetAllTaxReceipt
{
    public class GetAllTaxReceiptQuery : IRequest<PagedResponse<TaxReceiptDto>>
    {
        public string? RncIdentification { get; set; }
        public int? Page { get; set; }
        public int? PageSize { get; set; }
    }

    public class GetAllTaxReceiptQueryHandler : IRequestHandler<GetAllTaxReceiptQuery, PagedResponse<TaxReceiptDto>>
    {
        private readonly ITaxReceiptRepository _taxReceiptRepository;
        private readonly ICacheService _cache;
        private readonly IMapper _mapper;

        public GetAllTaxReceiptQueryHandler(ITaxReceiptRepository taxReceiptRepository, ICacheService cache, IMapper mapper)
        {
            _taxReceiptRepository = taxReceiptRepository;
            _cache = cache;
            _mapper = mapper;
        }

        public async Task<PagedResponse<TaxReceiptDto>> Handle(GetAllTaxReceiptQuery request, CancellationToken cancellationToken)
        {
            var paginationKey = request.Page is null || request.PageSize is null || request.PageSize <= 0
                ? "no-page"
                : $"{request.Page}:{request.PageSize}";

            var cacheKey = $"list:{request.RncIdentification ?? "all"}:{paginationKey}";

            return await _cache.GetOrCreateAsync(CacheGroups.TaxReceipts, cacheKey,
                ct => QueryTaxReceiptsAsync(request, ct),
                cancellationToken: cancellationToken);
        }

        private async Task<PagedResponse<TaxReceiptDto>> QueryTaxReceiptsAsync(GetAllTaxReceiptQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Domain.Entities.TaxReceipt> query = _taxReceiptRepository.GetQuery();

            if (!string.IsNullOrWhiteSpace(request.RncIdentification))
            {
                var term = request.RncIdentification;
                query = query.Where(x => x.RncIdentification == term);
            }

            var totalItems = await query.CountAsync(cancellationToken);

            List<Domain.Entities.TaxReceipt> items;
            int currentPage;
            int pageSize;

            // Sin paginacion -> listado completo ordenado por fecha
            if (request.Page is null || request.PageSize is null || request.PageSize <= 0)
            {
                items = await query
                    .OrderByDescending(x => x.CreatedAt)
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
                    .OrderByDescending(x => x.CreatedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync(cancellationToken);
            }

            var dtoList = _mapper.Map<List<TaxReceiptDto>>(items);

            return new PagedResponse<TaxReceiptDto>
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
