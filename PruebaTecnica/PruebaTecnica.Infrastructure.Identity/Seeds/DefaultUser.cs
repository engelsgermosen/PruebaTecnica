using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Infrastructure.Identity.Entities;

namespace PruebaTecnica.Infrastructure.Identity.Seeds
{
    public static class DefaultUser
    {
        public async static Task RunSeedAsync(UserManager<ApplicationUser> _userManager, RoleManager<IdentityRole> _roleManager)
        {
            ApplicationUser userNew = new()
            {
                FirstName = "Default",
                LastName = "User",
                Email = "DefaultUser@gmail.com",
                UserName = "DefaultUser",
                EmailConfirmed = true
            };

            var userSameEmail = await _userManager.FindByEmailAsync(userNew.Email);

            if (userSameEmail == null)
            {
                await _userManager.CreateAsync(userNew, "Pa$$word123");
            }
        }
    }
}