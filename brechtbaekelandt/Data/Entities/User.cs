using System.Collections.Generic;
using AutoMapper;

namespace brechtbaekelandt.Data.Entities
{
    public class User : BaseEntity
    {
        public string UserName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string EmailAddress { get; set; }

        public bool IsAdmin { get; set; }

        [IgnoreMap]
        public virtual ICollection<Post> Posts { get; set; }
    }
}