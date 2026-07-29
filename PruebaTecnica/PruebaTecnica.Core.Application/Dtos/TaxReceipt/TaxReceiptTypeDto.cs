namespace PruebaTecnica.Core.Application.Dtos.TaxReceipt
{
    // Tipo de comprobante fiscal (deriva del enum NcfType) para poblar el selector del front.
    public class TaxReceiptTypeDto
    {
        public int Id { get; set; }          // valor del enum (ej. 1)
        public string Code { get; set; } = null!;   // prefijo del NCF (ej. "B01")
        public string? Description { get; set; }
    }
}
