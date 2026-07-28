using AutoMapper;
using MediatR;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayer;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Commands.CreateTaxPayer
{
    public class CreateTaxPayerCommand : IRequest<TaxPayerDto>
    {
        public string? RncIdentification { get; set; }
        public string? Name { get; set; }

        public bool? Status { get; set; } 

        public int? TaxPayerTypeId { get; set; } 
    }

    public class CreateTaxPayerCommandHandler : IRequestHandler<CreateTaxPayerCommand, TaxPayerDto>
    {
        private readonly ITaxPayerRepository _taxPayerRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;

        public CreateTaxPayerCommandHandler(ITaxPayerRepository taxPayerRepository, IMapper mapper, ICacheService cache)
        {
            _taxPayerRepository = taxPayerRepository;
            _mapper = mapper;
            _cache = cache;
        }
        public async Task<TaxPayerDto> Handle(CreateTaxPayerCommand request, CancellationToken cancellationToken)
        {
            var existingTaxPayer = await _taxPayerRepository.GetByIdAsync(request?.RncIdentification ?? "");
            if(existingTaxPayer != null) throw new ApiException($"Contribuyente con Rnc o cedula {request?.RncIdentification} ya existe.", 409);
            var taxPayer = _mapper.Map<Domain.Entities.TaxPayer>(request);
            var createdTaxPayer = await _taxPayerRepository.AddAsync(taxPayer);
            await _cache.InvalidateGroupAsync(CacheGroups.TaxPayers, cancellationToken);
            return _mapper.Map<TaxPayerDto>(createdTaxPayer);
        }
    }
}