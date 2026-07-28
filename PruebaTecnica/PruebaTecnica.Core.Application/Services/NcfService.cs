using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Core.Domain.Entities;
using PruebaTecnica.Core.Application.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PruebaTecnica.Core.Application.Services
{
    public class NcfService
    {
        private readonly INcfSequenceRepository _sequenceRepository;

        public NcfService(INcfSequenceRepository ncfSequenceRepository)
        {
            _sequenceRepository = ncfSequenceRepository;
        }
        

    }
}
