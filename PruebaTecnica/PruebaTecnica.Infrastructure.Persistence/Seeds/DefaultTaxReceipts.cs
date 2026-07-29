using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Core.Domain.Enums;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.Infrastructure.Persistence.Seeds
{
    public static class DefaultTaxReceipts
    {
        // Usa el DbContext directamente porque necesita fijar CreatedAt en distintos meses,
        // y genera los NCF con la MISMA logica de secuencia que el handler (via INcfSequenceRepository),
        // de modo que la tabla NcfSequence queda coherente y la generacion continua sin colisionar.
        public static async Task RunTaxReceiptSeedAsync(ApplicationDbContext context, INcfSequenceRepository ncfSequenceRepository)
        {
            // Idempotencia: si ya hay comprobantes, no se vuelve a sembrar.
            if (await context.TaxReceipts.AnyAsync())
            {
                return;
            }

            var products = await context.Products.ToListAsync();
            var taxPayers = await context.TaxPayers.OrderBy(x => x.Id).ToListAsync();

            if (products.Count == 0 || taxPayers.Count < 3)
            {
                return;
            }

            Product Prod(string name) => products.First(p => p.Name == name);

            int year = DateTime.Now.Year;

            // Tipos mezclados para demostrar que los correlativos por tipo son INDEPENDIENTES:
            // B01 -> 00000001..00000006, B02 -> 00000001..00000002, B04 -> 00000001.
            var specs = new (NcfType Type, int TaxPayerIndex, int Month, (string Product, int Quantity)[] Lines)[]
            {
                (NcfType.B01, 0, 1,  new[] { ("Laptop Dell Inspiron 15", 2), ("Mouse inalambrico Logitech M170", 3) }),
                (NcfType.B01, 1, 2,  new[] { ("Resma de papel bond 8.5x11", 5), ("Toner HP 85A", 2) }),
                (NcfType.B02, 2, 3,  new[] { ("Monitor LG 24 pulgadas", 1), ("Teclado Logitech K380", 1), ("Webcam Logitech C920", 2) }),
                (NcfType.B01, 0, 4,  new[] { ("Silla ergonomica ejecutiva", 4) }),
                (NcfType.B02, 1, 6,  new[] { ("Impresora HP LaserJet Pro", 1), ("Toner HP 85A", 3), ("Resma de papel bond 8.5x11", 2) }),
                (NcfType.B01, 2, 7,  new[] { ("Disco SSD 1TB Kingston", 5), ("Laptop Dell Inspiron 15", 1) }),
                (NcfType.B04, 0, 9,  new[] { ("Monitor LG 24 pulgadas", 3), ("Mouse inalambrico Logitech M170", 3), ("Teclado Logitech K380", 3) }),
                (NcfType.B01, 1, 10, new[] { ("Webcam Logitech C920", 4), ("Silla ergonomica ejecutiva", 1) }),
                (NcfType.B01, 2, 12, new[] { ("Toner HP 85A", 2), ("Disco SSD 1TB Kingston", 2), ("Resma de papel bond 8.5x11", 4) }),
            };

            foreach (var spec in specs)
            {
                var taxPayer = taxPayers[spec.TaxPayerIndex];

                var receipt = new TaxReceipt
                {
                    RncIdentification = taxPayer.Id
                };

                foreach (var line in spec.Lines)
                {
                    receipt.AddDetail(Prod(line.Product), line.Quantity);
                }

                // Montos con la misma logica que el handler.
                receipt.CalculateTotals();

                // NCF correlativo generado por la secuencia (mismo camino que el handler).
                receipt.Ncf = await ncfSequenceRepository.GenerateNextNcf(spec.Type.ToString());

                context.TaxReceipts.Add(receipt);
                await context.SaveChangesAsync(); // estampa CreatedAt = ahora

                // Segundo save: corrige CreatedAt al mes deseado (el override Modified solo toca UpdatedAt).
                receipt.CreatedAt = new DateTime(year, spec.Month, 15);
                await context.SaveChangesAsync();
            }
        }
    }
}
