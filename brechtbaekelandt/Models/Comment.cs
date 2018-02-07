using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace brechtbaekelandt.Models
{
    public class Comment : Base
    {
        public DateTime Created { get; set; }

        public DateTime LastModified { get; set; }

        public string Title { get; set; }

        [Required(ErrorMessage = "you didn't fill in the comment!")]
        public string Content { get; set; }

        [Required(ErrorMessage = "you didn't fill in the name!")]
        public string Name { get; set; }

        [EmailAddress(ErrorMessage = "the email address is not valid!")]
        public string EmailAddress { get; set; }

        [JsonIgnore]
        public virtual Post Post { get; set; }
    }
}