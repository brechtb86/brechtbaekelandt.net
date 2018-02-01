using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using brechtbaekelandt.Data.Contexts.Identity;
using brechtbaekelandt.Identity.Models;

namespace brechtbaekelandt.Identity
{
    public class ApplicationRoleStore : RoleStore<ApplicationUserRole, ApplicationIdentityDbContext, Guid>
    {
        public ApplicationRoleStore(ApplicationIdentityDbContext context)
            : base(context)
        {
        }
    }
}