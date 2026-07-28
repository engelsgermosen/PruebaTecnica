using AutoMapper;
using MediatR;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayer;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Commands.UpdateTaxPayer
{
    public class UpdateTaxPayerCommand : IRequest<TaxPayerDto>
    {
        public string? RncIdentification { get; set; }
        public string? Name { get; set; }

        public bool? Status { get; set; } 

        public int? TaxPayerTypeId { get; set; } 
    }

    public class UpdateTaxPayerCommandHandler : IRequestHandler<UpdateTaxPayerCommand, TaxPayerDto>
    {
        private readonly ITaxPayerRepository _taxPayerRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;

        public UpdateTaxPayerCommandHandler(ITaxPayerRepository taxPayerRepository, IMapper mapper, ICacheService cache)
        {
            _taxPayerRepository = taxPayerRepository;
            _mapper = mapper;
            _cache = cache;
        }
        public async Task<TaxPayerDto> Handle(UpdateTaxPayerCommand request, CancellationToken cancellationToken)
        {
            var existing = await _taxPayerRepository.GetByIdAsync(request.RncIdentification!);

            if (existing == null)
            {
                throw new ApiException($"Contribuyente con rnc o cedula {request.RncIdentification} no encontrado.", 404);
            }

            var taxPayer = _mapper.Map<Domain.Entities.TaxPayer>(request);
            var updatedTaxPayer = await _taxPayerRepository.UpdateAsync(taxPayer, request?.RncIdentification!);
            await _cache.InvalidateGroupAsync(CacheGroups.TaxPayers, cancellationToken);
            return _mapper.Map<TaxPayerDto>(updatedTaxPayer);
        }
    }
}