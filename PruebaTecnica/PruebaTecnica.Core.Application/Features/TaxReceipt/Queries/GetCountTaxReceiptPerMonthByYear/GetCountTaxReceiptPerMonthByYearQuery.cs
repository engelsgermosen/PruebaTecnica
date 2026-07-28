using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.TaxReceipt.Queries.GetCountTaxReceiptPerMonthByYear
{
    public class GetCountTaxReceiptPerMonthByYearQuery : IRequest<IList<TaxReceiptPerMonth>>
    {
        public int? Year { get; set; }

    }

    public class GetCountTaxReceiptPerMonthByYearQueryHandler : IRequestHandler<GetCountTaxReceiptPerMonthByYearQuery, IList<TaxReceiptPerMonth>>
    {
        private readonly ITaxReceiptRepository _taxReceiptRepository;
        public GetCountTaxReceiptPerMonthByYearQueryHandler(ITaxReceiptRepository taxReceiptRepository)
        {
            _taxReceiptRepository = taxReceiptRepository;
        }
        public async Task<IList<TaxReceiptPerMonth>> Handle(GetCountTaxReceiptPerMonthByYearQuery request, CancellationToken cancellationToken)
        {
            var year = request.Year ?? DateTime.Now.Year;

            return await _taxReceiptRepository.GetQuery()
                .Where(x => x.CreatedAt.Year == year)
                .GroupBy(x => x.CreatedAt.Month)
                .Select(g => new TaxReceiptPerMonth
                {
                    Month = g.Key,
                    Count = g.Count()
                })
                .ToListAsync(cancellationToken);
        }

    }
}
