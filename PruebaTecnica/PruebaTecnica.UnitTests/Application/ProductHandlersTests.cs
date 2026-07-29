using AutoMapper;
using FluentAssertions;
using NSubstitute;
using PruebaTecnica.Core.Application.Cache;
using PruebaTecnica.Core.Application.Dtos.Product;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Features.Product.Commands.CreateProduct;
using PruebaTecnica.Core.Application.Features.Product.Commands.DeleteProduct;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.UnitTests.Common;

namespace PruebaTecnica.UnitTests.Application
{
    public class ProductHandlersTests
    {
        private readonly IProductRepository _products = Substitute.For<IProductRepository>();
        private readonly IMapper _mapper = Substitute.For<IMapper>();
        private readonly ICacheService _cache = Substitute.For<ICacheService>();

        [Fact]
        public async Task CreateProduct_Should_Throw_409_When_Name_Already_Exists()
        {
            _products.GetQuery().Returns(new TestAsyncEnumerable<Product>(
                new[] { new Product { Id = 1, Name = "Laptop", UnitPrice = 10m } }));

            var handler = new CreateProductCommandHandler(_products, _mapper, _cache);
            var act = () => handler.Handle(new CreateProductCommand { Name = "Laptop", UnitPrice = 5m }, CancellationToken.None);

            (await act.Should().ThrowAsync<ApiException>()).Which.ErrorCode.Should().Be(409);
        }

        [Fact]
        public async Task CreateProduct_Should_Add_And_Invalidate_Cache()
        {
            _products.GetQuery().Returns(new TestAsyncEnumerable<Product>(Array.Empty<Product>()));
            _mapper.Map<Product>(Arg.Any<CreateProductCommand>()).Returns(new Product { Name = "New", UnitPrice = 10m });
            _products.AddAsync(Arg.Any<Product>()).Returns(ci => Task.FromResult(ci.Arg<Product>()));
            _mapper.Map<ProductDto>(Arg.Any<Product>()).Returns(new ProductDto { Name = "New" });

            var handler = new CreateProductCommandHandler(_products, _mapper, _cache);
            await handler.Handle(new CreateProductCommand { Name = "New", UnitPrice = 10m }, CancellationToken.None);

            await _products.Received(1).AddAsync(Arg.Any<Product>());
            await _cache.Received(1).InvalidateGroupAsync(CacheGroups.Products, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task DeleteProduct_Should_SoftDelete_By_Setting_IsActive_False_Not_Hard_Delete()
        {
            var existing = new Product { Id = 5, Name = "ToRemove", UnitPrice = 10m, IsActive = true };
            _products.GetByIdAsync(5).Returns(existing);

            Product? updated = null;
            _products.UpdateAsync(Arg.Do<Product>(p => updated = p), 5).Returns(ci => Task.FromResult(ci.Arg<Product>()));
            _mapper.Map<ProductDto>(Arg.Any<Product>()).Returns(new ProductDto { Name = "ToRemove" });

            var handler = new DeleteProductCommandHandler(_products, _mapper, _cache);
            await handler.Handle(new DeleteProductCommand { Id = 5 }, CancellationToken.None);

            updated.Should().NotBeNull();
            updated!.IsActive.Should().BeFalse();
            await _products.Received(1).UpdateAsync(Arg.Any<Product>(), 5);
            await _products.DidNotReceive().DeleteAsync(Arg.Any<Product>());
            await _cache.Received(1).InvalidateGroupAsync(CacheGroups.Products, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task DeleteProduct_Should_Throw_404_When_Not_Found()
        {
            _products.GetByIdAsync(999).Returns((Product?)null);

            var handler = new DeleteProductCommandHandler(_products, _mapper, _cache);
            var act = () => handler.Handle(new DeleteProductCommand { Id = 999 }, CancellationToken.None);

            (await act.Should().ThrowAsync<ApiException>()).Which.ErrorCode.Should().Be(404);
        }
    }
}
