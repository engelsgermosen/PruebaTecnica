using FluentValidation.TestHelper;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Features.Product.Commands.CreateProduct;
using PruebaTecnica.Core.Application.Features.TaxReceipt.Commands.CreateTaxReceipt;
using PruebaTecnica.Core.Domain.Enums;

namespace PruebaTecnica.UnitTests.Application
{
    public class ValidatorsTests
    {
        private readonly CreateProductCommandValidator _productValidator = new();
        private readonly CreateTaxReceiptCommandValidator _receiptValidator = new();

        [Fact]
        public void CreateProduct_Name_Required()
        {
            var result = _productValidator.TestValidate(new CreateProductCommand { Name = "", UnitPrice = 10m });
            result.ShouldHaveValidationErrorFor(x => x.Name);
        }

        [Fact]
        public void CreateProduct_UnitPrice_Must_Be_Greater_Than_Zero()
        {
            var result = _productValidator.TestValidate(new CreateProductCommand { Name = "Ok", UnitPrice = 0m });
            result.ShouldHaveValidationErrorFor(x => x.UnitPrice);
        }

        [Fact]
        public void CreateProduct_Valid_Passes()
        {
            var result = _productValidator.TestValidate(new CreateProductCommand { Name = "Ok", UnitPrice = 10m });
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void CreateTaxReceipt_Requires_At_Least_One_Line()
        {
            var result = _receiptValidator.TestValidate(new CreateTaxReceiptCommand
            {
                TaxReceiptTypeId = NcfType.B01,
                RncIdentification = "101023456",
                Details = new List<CreateTaxReceiptDetailDto>()
            });
            result.ShouldHaveValidationErrorFor(x => x.Details);
        }

        [Fact]
        public void CreateTaxReceipt_Requires_Valid_Type()
        {
            var result = _receiptValidator.TestValidate(new CreateTaxReceiptCommand
            {
                TaxReceiptTypeId = (NcfType)999, // fuera del enum
                RncIdentification = "101023456",
                Details = new() { new CreateTaxReceiptDetailDto { ProductId = 1, Quantity = 1 } }
            });
            result.ShouldHaveValidationErrorFor(x => x.TaxReceiptTypeId);
        }

        [Fact]
        public void CreateTaxReceipt_Line_Quantity_Must_Be_Greater_Than_Zero()
        {
            var result = _receiptValidator.TestValidate(new CreateTaxReceiptCommand
            {
                TaxReceiptTypeId = NcfType.B01,
                RncIdentification = "101023456",
                Details = new() { new CreateTaxReceiptDetailDto { ProductId = 1, Quantity = 0 } }
            });
            result.ShouldHaveValidationErrorFor("Details[0].Quantity");
        }

        [Fact]
        public void CreateTaxReceipt_Valid_Passes()
        {
            var result = _receiptValidator.TestValidate(new CreateTaxReceiptCommand
            {
                TaxReceiptTypeId = NcfType.B01,
                RncIdentification = "101023456",
                Details = new() { new CreateTaxReceiptDetailDto { ProductId = 1, Quantity = 2 } }
            });
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
