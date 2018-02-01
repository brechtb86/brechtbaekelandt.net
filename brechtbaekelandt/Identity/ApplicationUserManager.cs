using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using brechtbaekelandt.Identity.Models;
using Microsoft.EntityFrameworkCore;


namespace brechtbaekelandt.Identity
{
    public class ApplicationUserManager : UserManager<ApplicationUser>

    {
        public ApplicationUserManager(
            ApplicationUserStore store,
            IOptions<IdentityOptions> optionsAccessor,
            IPasswordHasher<ApplicationUser> passwordHasher,
            IEnumerable<IUserValidator<ApplicationUser>> userValidators,
            IEnumerable<IPasswordValidator<ApplicationUser>> passwordValidators,
            ILookupNormalizer lookupNormalizer,
            IdentityErrorDescriber identityErrorDescriber,
            IServiceProvider services,
            ILogger<ApplicationUserManager> logger
            ) : base(
                store,
                optionsAccessor,
                passwordHasher,
                userValidators,
                passwordValidators,
                lookupNormalizer,
                identityErrorDescriber,
                services,
                logger)
        {
        }

        public async Task<ICollection<ApplicationUser>> GetAllUsersAsync()
        {
            return new Collection<ApplicationUser>(await this.Users.ToListAsync());
        }

        public async Task<IdentityResult> CreateUserAsync(Guid id, string userName, string password, string emailAddress, string firstName, string lastName, bool isAdmin)
        {
            return await this.CreateAsync(
                 new ApplicationUser
                 {
                     Id = id,
                     EmailAddress = emailAddress,
                     Email = emailAddress,
                     UserName = userName,
                     FirstName = firstName,
                     LastName = lastName,
                     IsAdmin = isAdmin,
                 }, password);
        }
    }
}