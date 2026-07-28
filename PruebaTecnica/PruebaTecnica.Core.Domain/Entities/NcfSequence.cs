using PruebaTecnica.Core.Domain.Common;

namespace PruebaTecnica.Core.Domain.Entities
{
    public class NcfSequence : BaseEntity<int>
    {
        public string TipoComprobante { get; set; } = null!; 
        public string Establecimiento { get; set; } = null!; 

        public int LastNumber { get; set; }
    }

}
