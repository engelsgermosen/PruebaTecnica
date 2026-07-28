using AutoMapper;
using Moq;
using PruebaTecnica.Core.Application.Interfaces.Repositories;

namespace PruebaTecnica.Test.UnitTest.Features.TaxReceipt.Commands;

public class CreateTaxReceiptCommandTest
{
    [Fact]

    public async Task TestMethod1()
    {
         Mock<ITaxReceiptRepository> _taxReceiptRepository = new();
         Mock<INcfSequenceRepository> _cfSequenceRepository = new();
         Mock<IMapper> _mapper = new();
         Mock<ITaxPayerRepository> _taxPayerRepository = new();

       
    }
}
