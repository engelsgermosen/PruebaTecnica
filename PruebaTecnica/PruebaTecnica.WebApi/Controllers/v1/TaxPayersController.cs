using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Core.Application.Dtos.TaxPayer;
using PruebaTecnica.Core.Application.Features.TaxPayer.Commands.CreateTaxPayer;
using PruebaTecnica.Core.Application.Features.TaxPayer.Commands.DeleteTaxPayer;
using PruebaTecnica.Core.Application.Features.TaxPayer.Commands.UpdateTaxPayer;
using PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetAllTaxPayer;
using PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetAllTaxReceiptByTaxPayer;
using PruebaTecnica.Core.Application.Features.TaxPayer.Queries.GetByIdTaxPayer;
using Swashbuckle.AspNetCore.Annotations;

namespace PruebaTecnica.WebApi.Controllers.v1
{
    [ApiVersion("1.0")]
    [SwaggerTag("TaxPayer")]
    public class TaxPayersController : BaseApiController
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK,Type = typeof(IList<TaxPayerDto>))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [SwaggerOperation(summary:"Retrieve all Tax Payers", 
                          description: "Gets a list of all Tax Payers available in the system.")]
        public async Task<IActionResult> Get([FromQuery] string? rncIdentification, [FromQuery] int? page, [FromQuery] int? pageSize)
        {
            var response = await Mediator.Send(new GetAllTaxPayerQuery
            {
                RncIdentification = rncIdentification,
                Page = page,
                PageSize = pageSize
            });
            return Ok(response);
        }

        [HttpGet("{rncIdentification}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TaxPayerDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(summary: "Retrieve a Tax Payer by RNC Or Identification",
                          description: "Gets the details of a specific Tax Payer by RNC or identification.")]
        public async Task<IActionResult> GetById(string rncIdentification)
        {
            return  Ok(await Mediator.Send(new GetByIdTaxPayerQuery { RncIdentification = rncIdentification }));
        }

        [HttpGet("{rncIdentification}/taxreceipts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IList<TaxPayerDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(summary: "Retrieve a Tax Payer by RNC Or Identification",
                          description: "Gets the details of a specific Tax Payer by RNC or identification.")]
        public async Task<IActionResult> GetReceiptById(string rncIdentification)
        {
            return Ok(await Mediator.Send(new GetAllTaxReceiptByTaxPayerQuery { RncIdentification = rncIdentification }));
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [SwaggerOperation(summary: "Create a new Tax Payer",
                          description: "Creates a new Tax Payer with the provided details.")]

        public async Task<IActionResult> Create([FromBody] CreateTaxPayerCommand command)
        {
            await Mediator.Send(command);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut("{rncIdentification}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type =typeof(TaxPayerDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(summary: "Update an existing Tax Payer",
                          description: "Updates the details of an existing Tax Payer identified by Rnc or Identification.")]

        public async Task<IActionResult> Update(string rncIdentification, [FromBody] UpdateTaxPayerCommand command)
        {
            if(rncIdentification != command.RncIdentification)
            {
                return BadRequest("The rncIdentification in the URL does not match the rncIdentification in the request body.");
            }
            return Ok(await Mediator.Send(command));
        }



        [HttpDelete("{rncIdentification}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(summary: "Delete a Tax Payer",
                          description: "Deletes an existing Tax Payer identified by Rnc Or Identification")]
        public async Task<IActionResult> Delete(string rncIdentification)
        {
            await Mediator.Send(new DeleteTaxPayerCommand { RncIdentification = rncIdentification });
            return NoContent();
        }
    }
}
