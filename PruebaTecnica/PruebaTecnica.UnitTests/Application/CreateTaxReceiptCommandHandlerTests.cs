using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Features.TaxReceipt.Commands.CreateTaxReceipt;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Core.Domain.Enums;
using PruebaTecnica.UnitTests.Common;

namespace PruebaTecnica.UnitTests.Application
{
    public class CreateTaxReceiptCommandHandlerTests
    {
        private readonly ITaxReceiptRepository _receipts = Substitute.For<ITaxReceiptRepository>();
        private readonly ITaxPayerRepository _taxPayers = Substitute.For<ITaxPayerRepository>();
        private readonly IProductRepository _products = Substitute.For<IProductRepository>();
        private readonly INcfSequenceRepository _ncf = Substitute.For<INcfSequenceRepository>();
        private readonly IMapper _mapper = Substitute.For<IMapper>();
        private readonly ICacheService _cache = Substitute.For<ICacheService>();
        private readonly ILogger<CreateTaxReceiptCommandHandler> _logger = Substitute.For<ILogger<CreateTaxReceiptCommandHandler>>();

        private CreateTaxReceiptCommandHandler Handler() =>
            new(_receipts, _taxPayers, _products, _ncf, _mapper, _cache, _logger);

        private void TaxPayerExists(string rnc = "101023456")
            => _taxPayers.GetQuery().Returns(new TestAsyncEnumerable<TaxPayer>(new[] { new TaxPayer { Id = rnc, Name = "TP" } }));

        private void ProductsAre(params Product[] products)
            => _products.GetQuery().Returns(new TestAsyncEnumerable<Product>(products));

        private void NcfGeneratesReturns(string ncf)
            => _ncf.GenerateNextNcf(Arg.Any<string>(), Arg.Any<string?>()).Returns(ncf);

        private static CreateTaxReceiptCommand Cmd(string rnc, NcfType type, params (int id, int qty)[] lines) => new()
        {
            TaxReceiptTypeId = type,
            RncIdentification = rnc,
            Details = lines.Select(l => new CreateTaxReceiptDetailDto { ProductId = l.id, Quantity = l.qty }).ToList()
        };

        [Fact]
        public async Task Handle_Should_Generate_Ncf_From_Type_Compute_Amounts_And_Populate_Snapshots()
        {
            TaxPayerExists();
            ProductsAre(new Product { Id = 1, Name = "Laptop", UnitPrice = 42500m, IsActive = true });
            NcfGeneratesReturns("B0100000001");

            TaxReceipt? captured = null;
            _receipts.AddAsync(Arg.Do<TaxReceipt>(r => captured = r))
                     .Returns(ci => Task.FromResult(ci.Arg<TaxReceipt>()));
            _mapper.Map<TaxReceiptDto>(Arg.Any<TaxReceipt>()).Returns(new TaxReceiptDto());

            await Handler().Handle(Cmd("101023456", NcfType.B01, (1, 2)), CancellationToken.None);

            captured.Should().NotBeNull();
            captured!.Ncf.Should().Be("B0100000001");     // NCF generado por el servidor
            captured.Amount.Should().Be(85000m);
            captured.Itbis18.Should().Be(15300m);
            captured.Total.Should().Be(100300m);
            captured.Details.Single().ProductName.Should().Be("Laptop");

            // El tipo se pasa al generador como su codigo ("B01").
            await _ncf.Received(1).GenerateNextNcf("B01");
            await _cache.Received(1).InvalidateGroupAsync(CacheGroups.TaxReceipts, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_Should_Not_Consume_Ncf_When_TaxPayer_Missing()
        {
            _taxPayers.GetQuery().Returns(new TestAsyncEnumerable<TaxPayer>(Array.Empty<TaxPayer>()));

            var act = () => Handler().Handle(Cmd("999999999", NcfType.B01, (1, 1)), CancellationToken.None);

            (await act.Should().ThrowAsync<ApiException>()).Which.ErrorCode.Should().Be(400);
            // No se genero NCF: la validacion corta antes.
            await _ncf.DidNotReceive().GenerateNextNcf(Arg.Any<string>(), Arg.Any<string?>());
        }

        [Fact]
        public async Task Handle_Should_Not_Consume_Ncf_When_Product_Inactive()
        {
            TaxPayerExists();
            ProductsAre(new Product { Id = 1, Name = "P", UnitPrice = 10m, IsActive = false });

            var act = () => Handler().Handle(Cmd("101023456", NcfType.B01, (1, 1)), CancellationToken.None);

            (await act.Should().ThrowAsync<ApiException>()).Which.ErrorCode.Should().Be(400);
            await _ncf.DidNotReceive().GenerateNextNcf(Arg.Any<string>(), Arg.Any<string?>());
        }

        [Fact]
        public async Task Handle_Should_Throw_400_When_Product_Does_Not_Exist()
        {
            TaxPayerExists();
            ProductsAre(); // ninguno

            var act = () => Handler().Handle(Cmd("101023456", NcfType.B01, (999, 1)), CancellationToken.None);

            (await act.Should().ThrowAsync<ApiException>()).Which.ErrorCode.Should().Be(400);
        }
    }
}
