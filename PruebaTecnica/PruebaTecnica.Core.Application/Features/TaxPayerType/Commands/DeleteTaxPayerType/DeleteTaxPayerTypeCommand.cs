using AutoMapper;
using MediatR;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayerType;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.DeleteTaxPayerType
{
    public class DeleteTaxPayerTypeCommand : IRequest<TaxPayerTypeDto>
    {
        public int? Id { get; set; }
    }

    public class DeleteTaxPayerTypeCommandHandler : IRequestHandler<DeleteTaxPayerTypeCommand, TaxPayerTypeDto>
    {
        private readonly ITaxPayerTypeRepository _taxPayerTypeRepository;
        private readonly IMapper _mapper;

        public DeleteTaxPayerTypeCommandHandler(ITaxPayerTypeRepository taxPayerTypeRepository, IMapper mapper)
        {
            _taxPayerTypeRepository = taxPayerTypeRepository;
            _mapper = mapper;
        }
        public async Task<TaxPayerTypeDto> Handle(DeleteTaxPayerTypeCommand request, CancellationToken cancellationToken)
        {
            var taxPayerType = await _taxPayerTypeRepository.GetByIdAsync(request.Id!.Value);
            
            if(taxPayerType == null)
            {
                throw new ApiException($"Tipo de contribuyente con Id {request.Id} no encontrado.", 404);
            }

            await _taxPayerTypeRepository.DeleteAsync(taxPayerType);
            return _mapper.Map<TaxPayerTypeDto>(taxPayerType);
        }
    }
}