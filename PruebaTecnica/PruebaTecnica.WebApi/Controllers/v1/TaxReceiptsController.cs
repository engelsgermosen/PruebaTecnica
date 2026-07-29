using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Features.TaxReceipt.Commands.CreateTaxReceipt;
using PruebaTecnica.Core.Application.Features.TaxReceipt.Queries.GetAllTaxReceipt;
using PruebaTecnica.Core.Application.Features.TaxReceipt.Queries.GetCountTaxReceiptPerMonthByYear;
using PruebaTecnica.WebApi.Controllers;
using Swashbuckle.AspNetCore.Annotations;

namespace PruebaTecnica.WebApi.Controllers.v1
{
    [ApiVersion("1.0")]
    [SwaggerTag("TaxReceipt")]
    public class TaxReceiptsController : BaseApiController
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK,Type = typeof(IList<TaxReceiptDto>))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [SwaggerOperation(summary:"Retrieve all Tax Receipts", 
                          description: "Gets a list of all Tax Receipts available in the system.")]
        public async Task<IActionResult> Get([FromQuery] string? rncIdentification,[FromQuery] int? page, [FromQuery] int? pageSize)
        {
            var response = await Mediator.Send(new GetAllTaxReceiptQuery {Page = page, PageSize = pageSize, RncIdentification = rncIdentification });
            return Ok(response);
        }


        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TaxReceiptDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [SwaggerOperation(summary: "Create a new Tax Receipt",
                          description: "Creates a Tax Receipt from product detail lines. Amounts (Amount, Itbis18, Total) are computed on the server.")]

        public async Task<IActionResult> Create([FromBody] CreateTaxReceiptCommand command)
        {
            var created = await Mediator.Send(command);
            return StatusCode(StatusCodes.Status201Created, created);
        }

        [HttpGet("stats/monthly")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IList<TaxReceiptPerMonth>))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [SwaggerOperation(summary: "Retrieve all Tax Receipts per month by year",
                         description: "Gets a list of all Tax Receipts per month by year.")]
        public async Task<IActionResult> Get([FromQuery] int? year)
        {
            var response = await Mediator.Send(new GetCountTaxReceiptPerMonthByYearQuery { Year = year });
            return Ok(response);
        }
    }
}
