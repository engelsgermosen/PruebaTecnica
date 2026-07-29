using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayer;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetAllTaxReceiptByTaxPayer
{
    public class GetAllTaxReceiptByTaxPayerQuery : IRequest<TaxPayerDto>
    {
        public string? RncIdentification { get; set; }
    }

    public class GetAllTaxReceiptByTaxPayerQueryHandler : IRequestHandler<GetAllTaxReceiptByTaxPayerQuery, TaxPayerDto>
    {
        private readonly IMapper _mapper;
        private readonly ITaxPayerRepository _taxPayerRepository;

        public GetAllTaxReceiptByTaxPayerQueryHandler(IMapper mapper, ITaxPayerRepository taxPayerRepository)
        {
            _mapper = mapper;
            _taxPayerRepository = taxPayerRepository;
        }

        public async Task<TaxPayerDto> Handle(GetAllTaxReceiptByTaxPayerQuery request, CancellationToken cancellationToken)
        {
            var taxPayer = await _taxPayerRepository
                .GetQuery()
                .Include(x => x.TaxPayerType)
                .Include(x => x.TaxReceipts)!
                    .ThenInclude(r => r.Details)
                .FirstOrDefaultAsync(x => x.Id == request.RncIdentification, cancellationToken);

            if (taxPayer == null)
            {
                throw new ApiException($"Contribuyente con rnc o cedula {request?.RncIdentification} no encontrado.", 404);
            }

            if(taxPayer.TaxReceipts?.Count > 0)
            {
                taxPayer.TaxReceipts = taxPayer.TaxReceipts.OrderByDescending(x => x.CreatedAt).ToList();
            }


            return _mapper.Map<TaxPayerDto>(taxPayer);
        }
    }
}
