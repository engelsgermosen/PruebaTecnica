namespace PruebaTecnica.Core.Application.Dtos.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public bool IsActive { get; set; }
    }
}
