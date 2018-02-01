using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using brechtbaekelandt.Extensions;

namespace brechtbaekelandt.Models
{
    public class Post : Base
    {
        public DateTime Created { get; set; }

        public DateTime LastModified { get; set; }

        public string Title { get; set; }

        public string InternalTitle => this.Title.RemoveSpecialCharactersAndSpaces().ToLower();

        public string Description { get; set; }

        public string CleanDescription => Regex.Replace(this.Description, "<.*?>", String.Empty);

        public string Content { get; set; }

        public string CleanContent => Regex.Replace(this.Content, "<.*?>", String.Empty);

        public virtual User User { get; set; }

        public string PictureUrl { get; set; }

        public virtual ICollection<Category> Categories { get; set; }

        public virtual ICollection<Comment> Comments { get; set; }
    }
}