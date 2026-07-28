using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayer;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.TaxPayer.Commands.DeleteTaxPayer
{
    public class DeleteTaxPayerCommand : IRequest<TaxPayerDto>
    {
        public string? RncIdentification { get; set; }
    }

    public class DeleteTaxPayerCommandHandler : IRequestHandler<DeleteTaxPayerCommand, TaxPayerDto>
    {
        private readonly ITaxPayerRepository _taxPayerRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;

        public DeleteTaxPayerCommandHandler(ITaxPayerRepository taxPayerRepository, IMapper mapper, ICacheService cache)
        {
            _taxPayerRepository = taxPayerRepository;
            _mapper = mapper;
            _cache = cache;
        }
        public async Task<TaxPayerDto> Handle(DeleteTaxPayerCommand request, CancellationToken cancellationToken)
        {
            var taxPayer = await _taxPayerRepository.GetQuery().FirstOrDefaultAsync(tp => tp.Id == request.RncIdentification, cancellationToken);

            if(taxPayer == null)
            {
                throw new ApiException($"Contribuyente con Rnc o cedula {request.RncIdentification} no encontrado.", 404);
            }

            await _taxPayerRepository.DeleteAsync(taxPayer);
            await _cache.InvalidateGroupAsync(CacheGroups.TaxPayers, cancellationToken);
            return _mapper.Map<TaxPayerDto>(taxPayer);
        }
    }
}