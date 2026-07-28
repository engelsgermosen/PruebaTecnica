using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayerType;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.CreateTaxPayerType
{
    public class CreateTaxPayerTypeCommand : IRequest<TaxPayerTypeDto>
    {
        public string? Name { get; set; }
    }

    public class CreateTaxPayerTypeCommandHandler : IRequestHandler<CreateTaxPayerTypeCommand, TaxPayerTypeDto>
    {
        private readonly ITaxPayerTypeRepository _taxPayerTypeRepository;
        private readonly IMapper _mapper;

        public CreateTaxPayerTypeCommandHandler(ITaxPayerTypeRepository taxPayerTypeRepository, IMapper mapper)
        {
            _taxPayerTypeRepository = taxPayerTypeRepository;
            _mapper = mapper;
        }
        public async Task<TaxPayerTypeDto> Handle(CreateTaxPayerTypeCommand request, CancellationToken cancellationToken)
        {
            var existingTaxPayerType = await _taxPayerTypeRepository.GetQuery()
                .FirstOrDefaultAsync(tpt => tpt.Name!.ToLower() == request.Name!.ToLower(), cancellationToken);

            if (existingTaxPayerType != null)
            {
                throw new ApiException($"Tipo de contribuyente con Name '{request.Name}' ya existe.", 409);
            }
                var taxPayerType = _mapper.Map<Domain.Entities.TaxPayerType>(request);
            var createdTaxPayerType = await _taxPayerTypeRepository.AddAsync(taxPayerType);
            return _mapper.Map<TaxPayerTypeDto>(createdTaxPayerType);
        }
    }
}