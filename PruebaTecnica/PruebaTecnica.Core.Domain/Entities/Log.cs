using PruebaTecnica.Core.Domain.Common;

namespace PruebaTecnica.Core.Domain.Entities
{
    public class Log : BaseEntity<int>
    {
        public DateTime Date { get; set; } = DateTime.Now;
        public string? Level { get; set; }
        public string? Message { get; set; }
        public string? Detail { get; set; }
        public string? User { get; set; }
        public string? Endpoint { get; set; }
    }
}