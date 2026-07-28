using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Domain.Enums;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;

namespace PruebaTecnica.Core.Application.Features.TaxReceipt.Commands.CreateTaxReceipt
{
    public class CreateTaxReceiptCommand : IRequest<TaxReceiptDto>
    {
        public NcfType Type { get; set; }
        public decimal? Amount { get; set; }
        public string? RncIdentification { get; set; }
    }

    public class CreateTaxReceiptCommandHandler : IRequestHandler<CreateTaxReceiptCommand, TaxReceiptDto>
    {
        private readonly ITaxReceiptRepository _taxReceiptRepository;
        private readonly INcfSequenceRepository _cfSequenceRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;

        private readonly ITaxPayerRepository _taxPayerRepository;
        public CreateTaxReceiptCommandHandler(ITaxReceiptRepository taxReceiptRepository, IMapper mapper, ITaxPayerRepository taxPayerRepository, INcfSequenceRepository cfSequenceRepository, ICacheService cache)
        {
            _taxReceiptRepository = taxReceiptRepository;
            _mapper = mapper;
            _taxPayerRepository = taxPayerRepository;
            _cfSequenceRepository = cfSequenceRepository;
            _cache = cache;
        }
        public async Task<TaxReceiptDto> Handle(CreateTaxReceiptCommand request, CancellationToken cancellationToken)
        {
            var taxReceipt = _mapper.Map<Domain.Entities.TaxReceipt>(request);

            var exitTaxPayer = await _taxPayerRepository.GetQuery().FirstOrDefaultAsync(x => x.Id == request.RncIdentification, cancellationToken);

            if (exitTaxPayer == null)
            {
                throw new ApiException("No existe un contribuyente con ese RNC o cedula.", 400);
            }

            taxReceipt.Ncf = await _cfSequenceRepository.GenerateNextNcf(request.Type.ToString());
            var createdTaxReceipt = await _taxReceiptRepository.AddAsync(taxReceipt);
            await _cache.InvalidateGroupAsync(CacheGroups.TaxReceipts, cancellationToken);
            return _mapper.Map<TaxReceiptDto>(createdTaxReceipt);
        }
    }
}
