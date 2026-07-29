using FluentAssertions;
using PruebaTecnica.Core.Domain.Constants;
using PruebaTecnica.Core.Domain.Entities;

namespace PruebaTecnica.UnitTests.Domain
{
    public class TaxReceiptCalculationTests
    {
        private static Product P(decimal unitPrice, string name = "P")
            => new() { Name = name, UnitPrice = unitPrice };

        [Fact]
        public void ItbisRate_Should_Be_18_Percent()
            => TaxRates.Itbis.Should().Be(0.18m);

        [Fact]
        public void SingleLine_Should_Compute_Subtotal_Amount_Itbis_Total()
        {
            var r = new TaxReceipt();
            r.AddDetail(P(100m), 3);
            r.CalculateTotals();

            r.Details.Single().Subtotal.Should().Be(300m);
            r.Amount.Should().Be(300m);
            r.Itbis18.Should().Be(54m);
            r.Total.Should().Be(354m);
        }

        [Fact]
        public void Itbis_Should_Round_AwayFromZero()
        {
            // 2.75 * 0.18 = 0.495 -> AwayFromZero a 2 decimales = 0.50
            var r = new TaxReceipt();
            r.AddDetail(P(2.75m), 1);
            r.CalculateTotals();

            r.Amount.Should().Be(2.75m);
            r.Itbis18.Should().Be(0.50m);
            r.Total.Should().Be(3.25m);
        }

        [Fact]
        public void Subtotal_Should_Round_Per_Line_AwayFromZero()
        {
            // round(0.125, 2, AwayFromZero) = 0.13
            var r = new TaxReceipt();
            r.AddDetail(P(0.125m), 1);

            r.Details.Single().Subtotal.Should().Be(0.13m);
        }

        [Fact]
        public void Rounding_Should_Be_PerLine_Then_Sum_Not_SumThenRound()
        {
            // Dos lineas de 0.125: por-linea = 0.13 + 0.13 = 0.26.
            // Sumar-luego-redondear daria round(0.25) = 0.25. Assert 0.26 prueba que es por linea.
            var r = new TaxReceipt();
            r.AddDetail(P(0.125m), 1);
            r.AddDetail(P(0.125m), 1);
            r.CalculateTotals();

            r.Amount.Should().Be(0.26m);
        }

        [Fact]
        public void MultipleLines_SameProduct_Should_Sum_Subtotals()
        {
            var product = P(10.50m, "Same");
            var r = new TaxReceipt();
            r.AddDetail(product, 2); // 21.00
            r.AddDetail(product, 3); // 31.50
            r.CalculateTotals();

            r.Details.Should().HaveCount(2);
            r.Amount.Should().Be(52.50m);
            r.Itbis18.Should().Be(9.45m);
            r.Total.Should().Be(61.95m);
        }

        [Fact]
        public void HighQuantities_Should_Compute()
        {
            var r = new TaxReceipt();
            r.AddDetail(P(42500.00m), 1000);
            r.CalculateTotals();

            r.Amount.Should().Be(42_500_000m);
            r.Itbis18.Should().Be(7_650_000m);
            r.Total.Should().Be(50_150_000m);
        }

        [Theory]
        [InlineData(100, 1, 100, 18, 118)]
        [InlineData(0.01, 1, 0.01, 0.00, 0.01)]   // 0.0018 -> round = 0.00
        [InlineData(2.75, 1, 2.75, 0.50, 3.25)]   // 0.495 -> AwayFromZero = 0.50
        public void Theory_Amount_Itbis_Total(decimal price, int qty, decimal amount, decimal itbis, decimal total)
        {
            var r = new TaxReceipt();
            r.AddDetail(P(price), qty);
            r.CalculateTotals();

            r.Amount.Should().Be(amount);
            r.Itbis18.Should().Be(itbis);
            r.Total.Should().Be(total);
        }
    }
}
