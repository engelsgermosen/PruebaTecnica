using FluentAssertions;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.UnitTests.Domain
{
    public class TaxReceiptSnapshotTests
    {
        [Fact]
        public void AddDetail_Should_Copy_ProductName_And_UnitPrice()
        {
            var product = new Product { Id = 7, Name = "Laptop", UnitPrice = 100m };
            var receipt = new TaxReceipt();

            receipt.AddDetail(product, 2);

            var line = receipt.Details.Single();
            line.ProductId.Should().Be(7);
            line.ProductName.Should().Be("Laptop");
            line.UnitPrice.Should().Be(100m);
            line.Quantity.Should().Be(2);
            line.Subtotal.Should().Be(200m);
        }

        [Fact]
        public void Changing_Product_After_AddDetail_Should_Not_Affect_Existing_Line()
        {
            var product = new Product { Id = 1, Name = "Original", UnitPrice = 100m };
            var receipt = new TaxReceipt();
            receipt.AddDetail(product, 1);

            // El producto cambia despues de emitir la linea.
            product.Name = "Changed";
            product.UnitPrice = 999m;

            var line = receipt.Details.Single();
            line.ProductName.Should().Be("Original");
            line.UnitPrice.Should().Be(100m);
            line.Subtotal.Should().Be(100m);
        }
    }
}
