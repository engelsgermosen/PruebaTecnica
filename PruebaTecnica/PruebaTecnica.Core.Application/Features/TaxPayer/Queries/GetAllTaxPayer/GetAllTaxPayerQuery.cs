using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.Pagination;
using PruebaTecnica.Core.Application.Dtos.TaxPayer;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetAllTaxPayer
{
    public class GetAllTaxPayerQuery : IRequest<PagedResponse<TaxPayerDto>>
    {
        public string? RncIdentification { get; set; }

        public int? Page { get; set; }
        public int? PageSize { get; set; }

    }

    public class GetAllTaxPayerQueryHandler : IRequestHandler<GetAllTaxPayerQuery, PagedResponse<TaxPayerDto>>
    {
        private readonly IMapper _mapper;
        private readonly ITaxPayerRepository _taxPayerRepository;
        private readonly ICacheService _cache;

        public GetAllTaxPayerQueryHandler(IMapper mapper, ITaxPayerRepository taxPayerRepository, ICacheService cache)
        {
            _mapper = mapper;
            _taxPayerRepository = taxPayerRepository;
            _cache = cache;
        }

        public async Task<PagedResponse<TaxPayerDto>> Handle(GetAllTaxPayerQuery request, CancellationToken cancellationToken)
        {
            var paginationKey = request.Page.HasValue && request.PageSize.HasValue && request.PageSize > 0
                ? $"{request.Page}:{request.PageSize}"
                : "no-page";

            var cacheKey = $"list:{request.RncIdentification ?? "all"}:{paginationKey}";

            return await _cache.GetOrCreateAsync(CacheGroups.TaxPayers, cacheKey,
                ct => QueryTaxPayersAsync(request, ct),
                cancellationToken: cancellationToken);
        }

        private async Task<PagedResponse<TaxPayerDto>> QueryTaxPayersAsync(GetAllTaxPayerQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Domain.Entities.TaxPayer> query = _taxPayerRepository
                .GetQuery()
                .Include(x => x.TaxPayerType);

            // Filtro por busqueda (RNC o Nombre)
            if (!string.IsNullOrWhiteSpace(request.RncIdentification))
            {
                var term = request.RncIdentification;
                query = query.Where(x =>
                    x.Id.StartsWith(term) ||
                    x.Name.Contains(term));
            }

            // Contar total con los filtros aplicados
            var totalItems = await query.CountAsync(cancellationToken);

            var response = new PagedResponse<TaxPayerDto>();

            // Si no hay paginacion, devuelvo los ultimos 150 registros
            if (request.Page is null || request.PageSize is null || request.PageSize <= 0)
            {
                var allItems = await query
                    .OrderBy(x => x.Id)
                    .Take(150)
                    .ToListAsync(cancellationToken);

                response.CurrentPage = 1;
                response.PageSize = allItems.Count;
                response.TotalItems = totalItems;
                response.TotalPages = 1;
                response.Items = _mapper.Map<IList<TaxPayerDto>>(allItems);
            }
            else
            {
                // Procesar paginacion
                var page = request.Page.Value <= 0 ? 1 : request.Page.Value;
                var pageSize = request.PageSize.Value <= 0 ? 10 : request.PageSize.Value;
                var skip = (page - 1) * pageSize;

                var paginatedItems = await query
                    .OrderBy(x => x.Id)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync(cancellationToken);

                response.CurrentPage = page;
                response.PageSize = pageSize;
                response.TotalItems = totalItems;
                response.TotalPages = (int)Math.Ceiling((double)totalItems / pageSize);
                response.Items = _mapper.Map<IList<TaxPayerDto>>(paginatedItems);
            }

            return response;
        }
    }
}
