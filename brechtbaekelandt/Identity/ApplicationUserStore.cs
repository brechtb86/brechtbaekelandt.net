using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using brechtbaekelandt.Data.Contexts.Identity;
using brechtbaekelandt.Identity.Models;

namespace brechtbaekelandt.Identity
{
    public class ApplicationUserStore : UserStore<ApplicationUser, ApplicationUserRole, ApplicationIdentityDbContext, Guid>


    {
        public ApplicationUserStore(ApplicationIdentityDbContext context)
        : base(context)
        {
        }
    }
}