using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayer;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetByIdTaxPayer
{
    public class GetByIdTaxPayerQuery : IRequest<TaxPayerDto>
    {
        public string? RncIdentification { get; set; }
    }

    public class GetByIdTaxPayerQueryHandler : IRequestHandler<GetByIdTaxPayerQuery, TaxPayerDto>
    {
        private readonly IMapper _mapper;
        private readonly ITaxPayerRepository _taxPayerRepository;

        public GetByIdTaxPayerQueryHandler(IMapper mapper, ITaxPayerRepository taxPayerRepository)
        {
            _mapper = mapper;
            _taxPayerRepository = taxPayerRepository;
        }

        public async Task<TaxPayerDto> Handle(GetByIdTaxPayerQuery request, CancellationToken cancellationToken)
        {
            var taxPayer = await _taxPayerRepository.GetQuery().Include(x => x.TaxPayerType)
                .FirstOrDefaultAsync(x => x.Id == request.RncIdentification, cancellationToken);

            if (taxPayer == null)
            {
                throw new ApiException($"Contribuyente con rnc o cedula {request?.RncIdentification} no encontrado.", 404);
            }

            return _mapper.Map<TaxPayerDto>(taxPayer);
        }
    }
}