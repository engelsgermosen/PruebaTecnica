using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Core.Application.Dtos.Product;
using PruebaTecnica.Core.Application.Features.Product.Commands.CreateProduct;
using PruebaTecnica.Core.Application.Features.Product.Commands.DeleteProduct;
using PruebaTecnica.Core.Application.Features.Product.Commands.UpdateProduct;
using PruebaTecnica.Core.Application.Features.Product.Queries.GetAllProduct;
using PruebaTecnica.Core.Application.Features.Product.Queries.GetByIdProduct;
using Swashbuckle.AspNetCore.Annotations;

namespace PruebaTecnica.WebApi.Controllers.v1
{
    [ApiVersion("1.0")]
    [SwaggerTag("Product")]
    public class ProductsController : BaseApiController
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IList<ProductDto>))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [SwaggerOperation(summary: "Retrieve all Products",
                          description: "Gets a paginated list of Products, optionally filtered by IsActive.")]
        public async Task<IActionResult> Get([FromQuery] bool? isActive, [FromQuery] int? page, [FromQuery] int? pageSize)
        {
            var response = await Mediator.Send(new GetAllProductQuery { IsActive = isActive, Page = page, PageSize = pageSize });
            return Ok(response);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ProductDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(summary: "Retrieve a Product by id",
                          description: "Gets the details of a specific Product.")]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await Mediator.Send(new GetByIdProductQuery { Id = id }));
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [SwaggerOperation(summary: "Create a new Product",
                          description: "Creates a new Product with the provided details.")]
        public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
        {
            await Mediator.Send(command);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ProductDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [SwaggerOperation(summary: "Update an existing Product",
                          description: "Updates the details of an existing Product identified by id.")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("The id in the URL does not match the id in the request body.");
            }
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [SwaggerOperation(summary: "Delete (deactivate) a Product",
                          description: "Soft-deletes a Product by setting IsActive to false.")]
        public async Task<IActionResult> Delete(int id)
        {
            await Mediator.Send(new DeleteProductCommand { Id = id });
            return NoContent();
        }
    }
}
