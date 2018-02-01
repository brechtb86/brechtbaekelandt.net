using System;

namespace brechtbaekelandt.Data.Entities
{
    public class Comment : BaseEntity
    {
        public DateTime Created { get; set; }

        public string Title { get; set; }

        public string Content { get; set; }

        public User User { get; set; }
        
        public virtual Post Post { get; set; }
    }
}