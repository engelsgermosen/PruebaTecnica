using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Features.TaxReceipt.Queries.GetAllTaxReceiptTypes;
using Swashbuckle.AspNetCore.Annotations;

namespace PruebaTecnica.WebApi.Controllers.v1
{
    [ApiVersion("1.0")]
    [SwaggerTag("TaxReceiptType")]
    public class TaxReceiptTypesController : BaseApiController
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IList<TaxReceiptTypeDto>))]
        [SwaggerOperation(summary: "Retrieve tax receipt types",
                          description: "Gets the list of NCF comprobante types to populate the selector.")]
        public async Task<IActionResult> Get()
        {
            var response = await Mediator.Send(new GetAllTaxReceiptTypesQuery());
            return Ok(response);
        }
    }
}
