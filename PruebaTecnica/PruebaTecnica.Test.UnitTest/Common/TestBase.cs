using AutoMapper;
using Microsoft.Extensions.Logging;
using PruebaTecnica.Core.Application.Mapping;
using System;

namespace PruebaTecnica.Test.UnitTest.Common
{
    public abstract class TestBase
    {
        protected IMapper Mapper => _mapper.Value;

        private readonly Lazy<IMapper> _mapper = new(() =>
        {

            var loggerFactory = LoggerFactory.Create(builder => { });

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<GeneralProfile>(); // Tus profiles reales
            }, loggerFactory);

            return config.CreateMapper();
        });
    }
}
