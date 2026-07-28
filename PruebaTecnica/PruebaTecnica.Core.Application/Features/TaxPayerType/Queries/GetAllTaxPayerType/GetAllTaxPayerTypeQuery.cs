using AutoMapper;
using MediatR;
using PruebaTecnica.Core.Application.Dtos.TaxPayerType;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Queries.GetAllTaxPayerType
{
    public class GetAllTaxPayerTypeQuery : IRequest<IList<TaxPayerTypeDto>>
    {

    }
    
    public class GetAllTaxPayerTypeQueryHandler : IRequestHandler<GetAllTaxPayerTypeQuery, IList<TaxPayerTypeDto>>
    {
        private readonly IMapper _mapper;
        private readonly ITaxPayerTypeRepository _taxPayerTypeRepository;

        public GetAllTaxPayerTypeQueryHandler(IMapper mapper, ITaxPayerTypeRepository taxPayerTypeRepository)
        {
            _mapper = mapper;
            _taxPayerTypeRepository = taxPayerTypeRepository;
        }

        public async Task<IList<TaxPayerTypeDto>> Handle(GetAllTaxPayerTypeQuery request, CancellationToken cancellationToken)
        {
            var taxPayerTypes = await _taxPayerTypeRepository.GetAllAsync(cancellationToken);
            return _mapper.Map<IList<TaxPayerTypeDto>>(taxPayerTypes);
        }
    }
}