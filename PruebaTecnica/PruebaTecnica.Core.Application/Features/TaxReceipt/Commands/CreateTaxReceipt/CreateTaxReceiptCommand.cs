using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Enums;

namespace PruebaTecnica.Core.Application.Features.TaxReceipt.Commands.CreateTaxReceipt
{
    public class CreateTaxReceiptCommand : IRequest<TaxReceiptDto>
    {
        // El cliente elige el TIPO; el servidor genera el correlativo del NCF.
        // Un 'ncf' en el body se ignora (no existe esa propiedad).
        public NcfType TaxReceiptTypeId { get; set; }
        public string? RncIdentification { get; set; }

        // El cliente solo envia ProductId + Quantity por linea.
        // Amount, Itbis18 y Total NUNCA vienen del request: se calculan en el servidor.
        public List<CreateTaxReceiptDetailDto> Details { get; set; } = new();
    }

    public class CreateTaxReceiptCommandHandler : IRequestHandler<CreateTaxReceiptCommand, TaxReceiptDto>
    {
        private readonly ITaxReceiptRepository _taxReceiptRepository;
        private readonly ITaxPayerRepository _taxPayerRepository;
        private readonly IProductRepository _productRepository;
        private readonly INcfSequenceRepository _ncfSequenceRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;
        private readonly ILogger<CreateTaxReceiptCommandHandler> _logger;

        public CreateTaxReceiptCommandHandler(
            ITaxReceiptRepository taxReceiptRepository,
            ITaxPayerRepository taxPayerRepository,
            IProductRepository productRepository,
            INcfSequenceRepository ncfSequenceRepository,
            IMapper mapper,
            ICacheService cache,
            ILogger<CreateTaxReceiptCommandHandler> logger)
        {
            _taxReceiptRepository = taxReceiptRepository;
            _taxPayerRepository = taxPayerRepository;
            _productRepository = productRepository;
            _ncfSequenceRepository = ncfSequenceRepository;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
        }

        public async Task<TaxReceiptDto> Handle(CreateTaxReceiptCommand request, CancellationToken cancellationToken)
        {
            // El contribuyente debe existir.
            var taxPayer = await _taxPayerRepository.GetQuery()
                .FirstOrDefaultAsync(x => x.Id == request.RncIdentification, cancellationToken);
            if (taxPayer == null)
            {
                throw new ApiException("No existe un contribuyente con ese RNC o cedula.", 400);
            }

            // Resolver los productos de las lineas desde la BD (nombre y precio salen de aqui, no del cliente).
            var productIds = request.Details.Select(d => d.ProductId).Distinct().ToList();
            var products = await _productRepository.GetQuery()
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync(cancellationToken);

            var taxReceipt = new Domain.Entities.TaxReceipt
            {
                RncIdentification = request.RncIdentification
            };

            foreach (var line in request.Details)
            {
                var product = products.FirstOrDefault(p => p.Id == line.ProductId);
                if (product is null || !product.IsActive)
                {
                    throw new ApiException($"El producto con id {line.ProductId} no existe o esta inactivo.", 400);
                }

                // Snapshot (nombre + precio) y subtotal se calculan en el dominio.
                taxReceipt.AddDetail(product, line.Quantity);
            }

            // Montos calculados en el servidor: Amount, Itbis18, Total.
            taxReceipt.CalculateTotals();

            // El NCF lo genera el servidor a partir del tipo (correlativo seguro ante concurrencia).
            // Se genera DESPUES de validar todo, para minimizar huecos si la validacion falla.
            taxReceipt.Ncf = await _ncfSequenceRepository.GenerateNextNcf(request.TaxReceiptTypeId.ToString());

            Domain.Entities.TaxReceipt created;
            try
            {
                // Un solo SaveChanges: comprobante + detalles se insertan de forma atomica (cascade).
                created = await _taxReceiptRepository.AddAsync(taxReceipt);
            }
            catch (Exception ex)
            {
                // El NCF ya fue consumido de la secuencia; si el insert falla, queda un HUECO.
                // Se loguea Warning para que el hueco sea trazable (muchos = senal de otro bug).
                _logger.LogWarning(ex,
                    "NCF {Ncf} consumido pero el comprobante no se pudo insertar (hueco en la secuencia). RNC {Rnc}.",
                    taxReceipt.Ncf, request.RncIdentification);
                throw;
            }

            await _cache.InvalidateGroupAsync(CacheGroups.TaxReceipts, cancellationToken);
            return _mapper.Map<TaxReceiptDto>(created);
        }
    }
}
