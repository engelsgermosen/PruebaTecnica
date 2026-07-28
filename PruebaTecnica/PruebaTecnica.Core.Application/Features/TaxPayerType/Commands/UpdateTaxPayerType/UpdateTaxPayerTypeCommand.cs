using AutoMapper;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Dtos.TaxPayerType;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.UpdateTaxPayerType
{
    public class UpdateTaxPayerTypeCommand : IRequest<TaxPayerTypeDto>
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
    }

    public class UpdateTaxPayerTypeCommandHandler : IRequestHandler<UpdateTaxPayerTypeCommand, TaxPayerTypeDto>
    {
        private readonly ITaxPayerTypeRepository _taxPayerTypeRepository;
        private readonly IMapper _mapper;

        public UpdateTaxPayerTypeCommandHandler(ITaxPayerTypeRepository taxPayerTypeRepository, IMapper mapper)
        {
            _taxPayerTypeRepository = taxPayerTypeRepository;
            _mapper = mapper;
        }
        public async Task<TaxPayerTypeDto> Handle(UpdateTaxPayerTypeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var taxPayerType = _mapper.Map<Domain.Entities.TaxPayerType>(request);
                if (taxPayerType == null) throw new ApiException("Tipo de contribuyente no encontrado.", 404);
                
                var updatedTaxPayerType = await _taxPayerTypeRepository.UpdateAsync(taxPayerType, request.Id ?? 0);
                return _mapper.Map<TaxPayerTypeDto>(updatedTaxPayerType);
            }
            catch (DbUpdateException ex) 
            {
                if (ex.InnerException is SqlException sqlEx && (sqlEx.Number == 2601 || sqlEx.Number == 2627))
                {
                    throw new ApiException("Ya existe un registro con ese valor unico en la base de datos.", 409);
                }
                throw new ApiException("Ocurrio un error al actualizar el tipo de contribuyente.");
            }
            
        }
    }
}