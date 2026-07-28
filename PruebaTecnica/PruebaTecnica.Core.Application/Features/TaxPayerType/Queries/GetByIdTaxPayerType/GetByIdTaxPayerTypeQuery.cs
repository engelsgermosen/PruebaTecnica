using AutoMapper;
using MediatR;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayerType;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Queries.GetByIdTaxPayerType
{
    public class GetByIdTaxPayerTypeQuery : IRequest<TaxPayerTypeDto>
    {
        public int? Id { get; set; }
    }

    public class GetByIdTaxPayerTypeQueryHandler : IRequestHandler<GetByIdTaxPayerTypeQuery, TaxPayerTypeDto>
    {
        private readonly IMapper _mapper;
        private readonly ITaxPayerTypeRepository _taxPayerTypeRepository;

        public GetByIdTaxPayerTypeQueryHandler(IMapper mapper, ITaxPayerTypeRepository taxPayerTypeRepository)
        {
            _mapper = mapper;
            _taxPayerTypeRepository = taxPayerTypeRepository;
        }

        public async Task<TaxPayerTypeDto> Handle(GetByIdTaxPayerTypeQuery request, CancellationToken cancellationToken)
        {
            var taxPayerType = await _taxPayerTypeRepository.GetByIdAsync(request.Id!.Value);

            if(taxPayerType == null)
            {
                throw new ApiException($"Tipo de contribuyente con Id {request.Id} no encontrado.", 404);
            }

            return _mapper.Map<TaxPayerTypeDto>(taxPayerType);
        }
    }
}