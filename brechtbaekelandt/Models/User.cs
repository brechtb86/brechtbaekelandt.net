using System.Collections.Generic;
using Newtonsoft.Json;

namespace brechtbaekelandt.Models
{
    public class User : Base
    {
        public string UserName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string FullName => $"{this.FirstName} {this.LastName}";

        public string EmailAddress { get; set; }

        public bool IsAdmin { get; set; }

        [JsonIgnore]
        public virtual ICollection<Post> Posts { get; set; }
    }
}