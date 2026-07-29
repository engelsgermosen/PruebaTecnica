using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Seeds
{
    public static class DefaultTaxPayers
    {
        public static async Task RunTaxPayerSeedAsync(ITaxPayerRepository taxPayerRepository, ITaxPayerTypeRepository taxPayerTypeRepository)
        {
            var fisica = await taxPayerTypeRepository.GetQuery()
                .FirstOrDefaultAsync(x => x.Name.ToUpper() == "PERSONAS FISICAS");
            var juridica = await taxPayerTypeRepository.GetQuery()
                .FirstOrDefaultAsync(x => x.Name.ToUpper() == "PERSONAS JURIDICAS");

            if (fisica == null || juridica == null)
            {
                return;
            }

            List<TaxPayer> defaultTaxPayers = new()
            {
                // RNC de 9 digitos (empresas) y cedula de 11 digitos (persona fisica).
                new TaxPayer { Id = "101023456", Name = "Distribuidora Nacional SRL", Status = true, TaxPayerTypeId = juridica.Id },
                new TaxPayer { Id = "130456789", Name = "Ferreteria El Constructor EIRL", Status = true, TaxPayerTypeId = juridica.Id },
                new TaxPayer { Id = "00112345678", Name = "Juan Alberto Perez Rodriguez", Status = true, TaxPayerTypeId = fisica.Id },

                // Caso verificable del PDF: sus dos comprobantes suman ITBIS = 216.00 (ver DefaultTaxReceipts).
                new TaxPayer { Id = "98754321012", Name = "JUAN PEREZ", Status = true, TaxPayerTypeId = fisica.Id },
            };

            foreach (var taxPayer in defaultTaxPayers)
            {
                var exists = await taxPayerRepository.GetByIdAsync(taxPayer.Id);
                if (exists == null)
                {
                    await taxPayerRepository.AddAsync(taxPayer);
                }
            }
        }
    }
}
