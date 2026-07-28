using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Core.Application.Dtos.TaxPayerType;
using PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.CreateTaxPayerType;
using PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.DeleteTaxPayerType;
using PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.UpdateTaxPayerType;
using PruebaTecnica.Core.Application.Features.TaxPayerType.Queries.GetAllTaxPayerType;
using PruebaTecnica.Core.Application.Features.TaxPayerType.Queries.GetByIdTaxPayerType;
using PruebaTecnica.WebApi.Controllers;
using Swashbuckle.AspNetCore.Annotations;

namespace PruebaTecnica.WebApi.Controllers.v1
{
    [Authorize]
    [SwaggerTag("TaxPayerType")]
    public class TaxPayerTypesController : BaseApiController
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK,Type = typeof(IList<TaxPayerTypeDto>))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [SwaggerOperation(summary:"Retrieve all Tax Payer Types", 
                          description: "Gets a list of all Tax Payer Types available in the system.")]
        public async Task<IActionResult> Get()
        {
            var response = await Mediator.Send(new GetAllTaxPayerTypeQuery());
            return response.Count > 0 ? Ok(response) : NoContent();
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TaxPayerTypeDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(summary: "Retrieve a Tax Payer Type by ID",
                          description: "Gets the details of a specific Tax Payer Type by its unique identifier.")]
        public async Task<IActionResult> GetById(int id)
        {
            return  Ok(await Mediator.Send(new GetByIdTaxPayerTypeQuery { Id = id }));
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [SwaggerOperation(summary: "Create a new Tax Payer Type",
                          description: "Creates a new Tax Payer Type with the provided details.")]

        public async Task<IActionResult> Create([FromBody] CreateTaxPayerTypeCommand command)
        {
            await Mediator.Send(command);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type =typeof(TaxPayerTypeDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(summary: "Update an existing Tax Payer Type",
                          description: "Updates the details of an existing Tax Payer Type identified by its ID.")]

        public async Task<IActionResult> Update(int id, [FromBody] UpdateTaxPayerTypeCommand command)
        {
            if(id != command.Id)
            {
                return BadRequest("The id in the URL does not match the id in the request body.");
            }
            return Ok(await Mediator.Send(command));
        }



        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(summary: "Delete a Tax Payer Type",
                          description: "Deletes an existing Tax Payer Type identified by its ID.")]
        public async Task<IActionResult> Delete(int id)
        {
            await Mediator.Send(new DeleteTaxPayerTypeCommand { Id = id });
            return NoContent();
        }
    }
}
