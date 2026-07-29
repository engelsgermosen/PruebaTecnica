namespace PruebaTecnica.Core.Application.Dtos.TaxReceipt
{
    // DTO de entrada de una linea: el cliente solo envia producto y cantidad.
    // El nombre, precio y subtotal los resuelve y calcula el servidor.
    public class CreateTaxReceiptDetailDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
