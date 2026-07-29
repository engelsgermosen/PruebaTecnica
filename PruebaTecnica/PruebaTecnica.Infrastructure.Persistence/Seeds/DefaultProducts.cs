using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.Infrastructure.Persistence.Seeds
{
    public static class DefaultProducts
    {
        public static async Task RunProductSeedAsync(IProductRepository productRepository)
        {
            List<Product> defaultProducts = new()
            {
                new Product { Name = "Laptop Dell Inspiron 15", Description = "Laptop 15.6\" Core i5, 8GB RAM, 512GB SSD", UnitPrice = 42500.00m },
                new Product { Name = "Monitor LG 24 pulgadas", Description = "Monitor LED Full HD 24\"", UnitPrice = 8900.00m },
                new Product { Name = "Teclado Logitech K380", Description = "Teclado inalambrico Bluetooth multidispositivo", UnitPrice = 1850.00m },
                new Product { Name = "Mouse inalambrico Logitech M170", Description = "Mouse inalambrico con receptor USB", UnitPrice = 750.00m },
                new Product { Name = "Resma de papel bond 8.5x11", Description = "Resma 500 hojas 20lb", UnitPrice = 285.00m },
                new Product { Name = "Toner HP 85A", Description = "Toner negro original HP LaserJet", UnitPrice = 4200.00m },
                new Product { Name = "Silla ergonomica ejecutiva", Description = "Silla de oficina con soporte lumbar", UnitPrice = 12500.00m },
                new Product { Name = "Impresora HP LaserJet Pro", Description = "Impresora laser monocromatica", UnitPrice = 15750.00m },
                new Product { Name = "Disco SSD 1TB Kingston", Description = "Unidad de estado solido SATA 2.5\" 1TB", UnitPrice = 5400.00m },
                new Product { Name = "Webcam Logitech C920", Description = "Camara web Full HD 1080p", UnitPrice = 3900.00m },

                // Productos de precio exacto usados por el caso verificable del PDF
                // (RNC 98754321012): 200.00 x1 => ITBIS 36.00 y 1000.00 x1 => ITBIS 180.00.
                new Product { Name = "Servicio de mensajeria local", Description = "Entrega de documentos dentro del Distrito Nacional", UnitPrice = 200.00m },
                new Product { Name = "Servicio de consultoria (hora)", Description = "Hora de consultoria profesional", UnitPrice = 1000.00m },
            };

            foreach (var product in defaultProducts)
            {
                var exists = await productRepository.GetQuery()
                    .FirstOrDefaultAsync(x => x.Name.ToUpper() == product.Name.ToUpper());

                if (exists == null)
                {
                    await productRepository.AddAsync(product);
                }
            }
        }
    }
}
