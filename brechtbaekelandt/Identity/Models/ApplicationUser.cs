using Microsoft.AspNetCore.Identity;
using System;

namespace brechtbaekelandt.Identity.Models
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string EmailAddress { get; set; }

        public bool IsAdmin { get; set; }

        public string FullName => $"{this.FirstName} {this.LastName}";
    }
}
