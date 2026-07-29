using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Infrastructure.Persistence.Contexts;

namespace PruebaTecnica.IntegrationTests
{
    public class ApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public ApiIntegrationTests(CustomWebApplicationFactory factory) => _factory = factory;

        private sealed record TokenResponse(string AccessToken, string RefreshToken);
        private sealed record PagedProducts(List<ProductItem> Items);
        private sealed record ProductItem(int Id, string Name, decimal UnitPrice, bool IsActive);
        private sealed record ReceiptResponse(int Id, string Ncf, decimal Amount, decimal Itbis18, decimal Total, List<ReceiptDetailItem> Details);
        private sealed record ReceiptDetailItem(int ProductId, string ProductName, decimal UnitPrice, int Quantity, decimal Subtotal);
        private sealed record TaxReceiptTypeItem(int Id, string Code, string Description);

        private async Task<string> GetTokenAsync(HttpClient client)
        {
            // DefaultUser sembrado por RunIdentitySeedAsync al arrancar la app.
            var resp = await client.PostAsJsonAsync("/api/v1/auth/login",
                new { email = "DefaultUser@gmail.com", password = "Pa$$word123" });
            resp.StatusCode.Should().Be(HttpStatusCode.OK);
            var token = await resp.Content.ReadFromJsonAsync<TokenResponse>();
            return token!.AccessToken;
        }

        private HttpClient AuthedClient(string token)
        {
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return client;
        }

        // ---------- Products: CRUD completo + 409 ----------
        [Fact]
        public async Task Products_Full_Crud_Including_Duplicate_Name_Conflict()
        {
            await _factory.ResetAppDataAsync();
            var anon = _factory.CreateClient();
            var client = AuthedClient(await GetTokenAsync(anon));

            // Create
            var create = await client.PostAsJsonAsync("/api/v1/products",
                new { name = "Prod A", description = "desc", unitPrice = 100.00m });
            create.StatusCode.Should().Be(HttpStatusCode.Created);

            // List -> obtener id
            var list = await client.GetFromJsonAsync<PagedProducts>("/api/v1/products");
            var created = list!.Items.Single(p => p.Name == "Prod A");
            created.UnitPrice.Should().Be(100.00m);
            created.IsActive.Should().BeTrue();

            // Duplicado -> 409
            var dup = await client.PostAsJsonAsync("/api/v1/products",
                new { name = "Prod A", description = "x", unitPrice = 5m });
            dup.StatusCode.Should().Be(HttpStatusCode.Conflict);

            // GetById
            var getById = await client.GetAsync($"/api/v1/products/{created.Id}");
            getById.StatusCode.Should().Be(HttpStatusCode.OK);

            // Update
            var update = await client.PutAsJsonAsync($"/api/v1/products/{created.Id}",
                new { id = created.Id, name = "Prod A Updated", description = "d", unitPrice = 150m, isActive = true });
            update.StatusCode.Should().Be(HttpStatusCode.OK);

            // Delete = soft delete
            var del = await client.DeleteAsync($"/api/v1/products/{created.Id}");
            del.StatusCode.Should().Be(HttpStatusCode.NoContent);

            var afterDelete = await client.GetFromJsonAsync<ProductItem>($"/api/v1/products/{created.Id}");
            afterDelete!.Name.Should().Be("Prod A Updated");
            afterDelete.IsActive.Should().BeFalse(); // soft delete, sigue existiendo
        }

        // ---------- TaxReceipts: POST -> 201 con montos calculados y snapshots ----------
        [Fact]
        public async Task Create_TaxReceipt_Returns_201_With_Server_Calculated_Amounts_And_Snapshots()
        {
            await _factory.ResetAppDataAsync();
            int productId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.TaxPayers.Add(new TaxPayer { Id = "101023456", Name = "Contribuyente Test" });
                var product = new Product { Name = "Laptop", UnitPrice = 42500.00m, IsActive = true };
                db.Products.Add(product);
                await db.SaveChangesAsync();
                productId = product.Id;
            }

            var client = AuthedClient(await GetTokenAsync(_factory.CreateClient()));

            var resp = await client.PostAsJsonAsync("/api/v1/taxreceipts", new
            {
                taxReceiptTypeId = 1,           // B01: el server genera el NCF
                rncIdentification = "101023456",
                ncf = "ZZZ-IGNORADO",           // debe ignorarse
                amount = 99999m,                // debe ignorarse
                details = new[] { new { productId, quantity = 2 } }
            });

            resp.StatusCode.Should().Be(HttpStatusCode.Created);
            var receipt = await resp.Content.ReadFromJsonAsync<ReceiptResponse>();
            receipt!.Ncf.Should().Be("B0100000001");   // generado por el server (secuencia reiniciada en el reset)
            receipt.Amount.Should().Be(85000.00m);     // 42500 * 2, no el 99999 del request
            receipt.Itbis18.Should().Be(15300.00m);    // 85000 * 0.18
            receipt.Total.Should().Be(100300.00m);

            var line = receipt.Details.Single();
            line.ProductName.Should().Be("Laptop");
            line.UnitPrice.Should().Be(42500.00m);
            line.Quantity.Should().Be(2);
            line.Subtotal.Should().Be(85000.00m);
        }

        // ---------- Restrict: borrar un producto usado en un comprobante debe fallar ----------
        [Fact]
        public async Task Deleting_A_Product_Used_In_A_Receipt_Should_Fail_Due_To_Restrict_Fk()
        {
            await _factory.ResetAppDataAsync();
            int productId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.TaxPayers.Add(new TaxPayer { Id = "101023456", Name = "TP" });
                var product = new Product { Name = "Usado", UnitPrice = 100m, IsActive = true };
                db.Products.Add(product);
                await db.SaveChangesAsync();

                var receipt = new TaxReceipt { Ncf = "B0100000009", RncIdentification = "101023456" };
                receipt.AddDetail(product, 1);
                receipt.CalculateTotals();
                db.TaxReceipts.Add(receipt);
                await db.SaveChangesAsync();
                productId = product.Id;
            }

            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var product = await db.Products.FindAsync(productId);
                db.Products.Remove(product!);

                var act = () => db.SaveChangesAsync();
                await act.Should().ThrowAsync<DbUpdateException>(); // FK Restrict lo bloquea
            }
        }

        // ---------- Endpoint de tipos (para el selector del front), anonimo ----------
        [Fact]
        public async Task Get_TaxReceiptTypes_Returns_Enum_List_Anonymously()
        {
            var client = _factory.CreateClient(); // sin token
            var resp = await client.GetAsync("/api/v1/taxreceipttypes");

            resp.StatusCode.Should().Be(HttpStatusCode.OK);
            var types = await resp.Content.ReadFromJsonAsync<List<TaxReceiptTypeItem>>();
            types!.Should().Contain(t => t.Id == 1 && t.Code == "B01");
            types.Should().Contain(t => t.Code == "B02");
            types.Should().Contain(t => t.Code == "B04");
        }

        // ---------- [Authorize] sin token -> 401 ----------
        [Fact]
        public async Task Authorized_Endpoint_Without_Token_Returns_401()
        {
            var client = _factory.CreateClient();
            var resp = await client.PostAsJsonAsync("/api/v1/products",
                new { name = "X", unitPrice = 1m });
            resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        // ---------- GlobalExceptionHandler via pipeline: 401 ProblemDetails + traceId ----------
        [Fact]
        public async Task Login_With_Bad_Credentials_Returns_401_ProblemDetails_With_TraceId()
        {
            var client = _factory.CreateClient();
            var resp = await client.PostAsJsonAsync("/api/v1/auth/login",
                new { email = "noexiste@nope.com", password = "wrong" });

            resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            var json = await resp.Content.ReadAsStringAsync();
            json.Should().Contain("\"traceId\"");
            json.Should().Contain("Credenciales inválidas.");
        }

        // ---------- ProblemDetails + traceId en un 404 mapeado ----------
        [Fact]
        public async Task GetById_Nonexistent_Product_Returns_404_ProblemDetails_With_TraceId()
        {
            await _factory.ResetAppDataAsync();
            var client = _factory.CreateClient();
            var resp = await client.GetAsync("/api/v1/products/999999");

            resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
            var json = await resp.Content.ReadAsStringAsync();
            json.Should().Contain("\"traceId\"");
        }
    }
}
