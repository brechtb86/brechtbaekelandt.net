using System.Threading.Tasks;
using brechtbaekelandt.Identity.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;


namespace brechtbaekelandt.Identity
{
    public class ApplicationSignInManager: SignInManager<ApplicationUser>
    {
        public ApplicationSignInManager(
            ApplicationUserManager userManager,
            IHttpContextAccessor contextAccessor,
            IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
            IOptions<IdentityOptions> options,
            ILogger<ApplicationSignInManager> logger,
            IAuthenticationSchemeProvider schemes
            )
            : base(
                userManager,
                contextAccessor,
                userClaimsPrincipalFactory,
                options,
                logger,
                schemes)
        {

        }

        public async Task<SignInResult> PasswordEmailSignInAsync(string emailAddress, string password, bool rememberMe, bool lockOutOnFailure)
        {
            var user = await this.UserManager.FindByEmailAsync(emailAddress);

            if (user == null)
            {
                return SignInResult.Failed;
            }

            return await this.PasswordSignInAsync(user, password, rememberMe, lockOutOnFailure);
        }
    }
}