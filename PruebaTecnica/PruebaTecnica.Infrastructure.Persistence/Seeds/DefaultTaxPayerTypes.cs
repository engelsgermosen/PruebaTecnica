using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Seeds
{
    public static class DefaultTaxPayerTypes
    {
        public static async Task RunTaxPayerTypeSeedAsync(ITaxPayerTypeRepository _taxPayerTypeRepository)
        {
            List<TaxPayerType> defaultTaxPayerTypes = new()
            {
                new TaxPayerType {Name = "PERSONAS FISICAS"},
                new TaxPayerType {Name = "PERSONAS JURIDICAS"},
            };

            foreach(TaxPayerType taxPayerType in defaultTaxPayerTypes)
            {
                var exits = await _taxPayerTypeRepository.GetQuery().FirstOrDefaultAsync(x => x.Name.ToUpper() == taxPayerType.Name.ToUpper());

                if(exits == null)
                {
                    await _taxPayerTypeRepository.AddAsync(taxPayerType);
                }
            }
        }
    }
}