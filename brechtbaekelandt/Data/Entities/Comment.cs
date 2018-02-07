using System;

namespace brechtbaekelandt.Data.Entities
{
    public class Comment : BaseEntity
    {
        public DateTime Created { get; set; }

        public DateTime LastModified { get; set; }

        public string Title { get; set; }

        public string Content { get; set; }

        public string Name { get; set; }

        public string EmailAddress { get; set; }

        public virtual Post Post { get; set; }
    }
}