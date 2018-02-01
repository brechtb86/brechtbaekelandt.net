using System;
using System.Collections.Generic;

namespace brechtbaekelandt.Data.Entities
{
    public class Post : BaseEntity
    {
        public DateTime Created { get; set; }

        public DateTime LastModified { get; set; }

        public string Title { get; set; }

        public string InternalTitle { get; set; }

        public string Description { get; set; }

        public string Content { get; set; }

        public virtual User User { get; set; }

        public string PictureUrl { get; set; }
        
        public virtual ICollection<PostCategory> PostCategories { get; set; }
        
        public virtual ICollection<Comment> Comments { get; set; }
    }
}