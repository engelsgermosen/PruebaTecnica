using MediatR;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Domain.Enums;

namespace PruebaTecnica.Core.Application.Features.TaxReceipt.Queries.GetAllTaxReceiptTypes
{
    public class GetAllTaxReceiptTypesQuery : IRequest<List<TaxReceiptTypeDto>>
    {
    }

    public class GetAllTaxReceiptTypesQueryHandler : IRequestHandler<GetAllTaxReceiptTypesQuery, List<TaxReceiptTypeDto>>
    {
        public Task<List<TaxReceiptTypeDto>> Handle(GetAllTaxReceiptTypesQuery request, CancellationToken cancellationToken)
        {
            var types = Enum.GetValues<NcfType>()
                .Select(t => new TaxReceiptTypeDto
                {
                    Id = (int)t,
                    Code = t.ToString(),
                    Description = Describe(t)
                })
                .ToList();

            return Task.FromResult(types);
        }

        private static string Describe(NcfType type) => type switch
        {
            NcfType.B01 => "Credito Fiscal",
            NcfType.B02 => "Consumo",
            NcfType.B03 => "Nota de Debito",
            NcfType.B04 => "Nota de Credito",
            NcfType.B11 => "Comprobante de Compras",
            NcfType.B12 => "Registro Unico de Ingresos",
            NcfType.B13 => "Gastos Menores",
            NcfType.B14 => "Regimenes Especiales",
            NcfType.B15 => "Gubernamental",
            NcfType.B16 => "Comprobante para Exportaciones",
            NcfType.E31 => "Factura de Credito Fiscal Electronica",
            NcfType.E32 => "Factura de Consumo Electronica",
            NcfType.E33 => "Nota de Debito Electronica",
            NcfType.E34 => "Nota de Credito Electronica",
            NcfType.E41 => "Compras Electronico",
            NcfType.E42 => "Gastos Menores Electronico",
            NcfType.E43 => "Regimenes Especiales Electronico",
            NcfType.E44 => "Gubernamental Electronico",
            NcfType.E45 => "Exportaciones Electronico",
            _ => type.ToString()
        };
    }
}
