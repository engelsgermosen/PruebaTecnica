using AutoMapper;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Core.Application.Dtos.Auth;
using PruebaTecnica.Core.Application.Dtos.Product;
using PruebaTecnica.Core.Application.Dtos.TaxPayer;
using PruebaTecnica.Core.Application.Dtos.TaxPayerType;
using PruebaTecnica.Core.Application.Dtos.TaxReceipt;
using PruebaTecnica.Core.Application.Features.Auth.Commands.Login;
using PruebaTecnica.Core.Application.Features.Product.Commands.CreateProduct;
using PruebaTecnica.Core.Application.Features.Product.Commands.UpdateProduct;
using PruebaTecnica.Core.Application.Features.TaxPayer.Commands.CreateTaxPayer;
using PruebaTecnica.Core.Application.Features.TaxPayer.Commands.UpdateTaxPayer;
using PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.CreateTaxPayerType;
using PruebaTecnica.Core.Application.Features.TaxPayerType.Commands.UpdateTaxPayerType;

namespace PruebaTecnica.Core.Application.Mapping
{
    public class GeneralProfile : Profile
    {
        public GeneralProfile()
        {

            #region Auth

            CreateMap<LoginCommand, AuthenticationRequestDto>().ReverseMap();

            #endregion

            #region TaxPayerType

            CreateMap<CreateTaxPayerTypeCommand, TaxPayerType>()
            .ForMember(x => x.TaxPayers, opt => opt.Ignore())
            .ForMember(x => x.Id, opt => opt.Ignore())
            .ForMember(x => x.CreatedAt, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore())
            .ReverseMap();

            CreateMap<UpdateTaxPayerTypeCommand, TaxPayerType>()
            .ForMember(x => x.TaxPayers, opt => opt.Ignore())
            .ForMember(x => x.CreatedAt, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore())
            .ReverseMap();

            CreateMap<TaxPayerType, TaxPayerTypeDto>()
            .ReverseMap()
            .ForMember(x => x.TaxPayers, opt => opt.Ignore())
            .ForMember(x => x.CreatedAt, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore());

            #endregion


            #region TaxPayer

            CreateMap<CreateTaxPayerCommand, TaxPayer>()
            .ForMember(x => x.TaxReceipts, opt => opt.Ignore())
            .ForMember(x => x.TaxPayerType, opt => opt.Ignore())
            .ForMember(x => x.Id, src => src.MapFrom(x => x.RncIdentification))
            .ForMember(x => x.CreatedAt, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore())
            .ReverseMap()
            .ForMember(x => x.RncIdentification, src => src.MapFrom(x => x.Id));

            CreateMap<UpdateTaxPayerCommand, TaxPayer>()
            .ForMember(x => x.TaxReceipts, opt => opt.Ignore())
            .ForMember(x => x.TaxPayerType, opt => opt.Ignore())
            .ForMember(x => x.CreatedAt, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore())
            .ForMember(x => x.Id , src => src.MapFrom(x => x.RncIdentification))
            .ReverseMap()
            .ForMember(x => x.RncIdentification, src => src.MapFrom(x => x.Id))
            ;

            CreateMap<TaxPayer, TaxPayerDto>()
            .ForMember(x => x.Type, src => src.MapFrom(x => x.TaxPayerType!.Name))
            .ForMember(x => x.RncIdentification, src => src.MapFrom(x => x.Id))
            .ForMember(x => x.TaxPayerTypeId, src => src.MapFrom(x => x.TaxPayerTypeId))
            .ForMember(x => x.TaxReceipts, src => src.MapFrom(x => x.TaxReceipts))
            .ReverseMap()
            .ForMember(x => x.TaxReceipts, opt => opt.Ignore())
            .ForMember(x => x.TaxPayerType, opt => opt.Ignore())
            .ForMember(x => x.TaxPayerTypeId, opt => opt.Ignore())
            .ForMember(x => x.CreatedAt, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore());

            #endregion

            #region TaxReceipt

            CreateMap<TaxReceiptDetail, TaxReceiptDetailDto>().ReverseMap();

            CreateMap<TaxReceipt, TaxReceiptDto>()
            .ReverseMap()
            .ForMember(x => x.TaxPayer, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore());

            #endregion

            #region Product

            CreateMap<CreateProductCommand, Product>()
            .ForMember(x => x.Id, opt => opt.Ignore())
            .ForMember(x => x.CreatedAt, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore())
            .ReverseMap();

            CreateMap<UpdateProductCommand, Product>()
            .ForMember(x => x.CreatedAt, opt => opt.Ignore())
            .ForMember(x => x.CreatedBy, opt => opt.Ignore())
            .ForMember(x => x.UpdatedAt, opt => opt.Ignore())
            .ForMember(x => x.UpdatedBy, opt => opt.Ignore())
            .ReverseMap();

            CreateMap<Product, ProductDto>().ReverseMap();

            #endregion

        }
    }
}
