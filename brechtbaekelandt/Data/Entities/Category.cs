using System.Collections.Generic;

namespace brechtbaekelandt.Data.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; }
        
        public virtual ICollection<PostCategory> PostCategories { get; set; }

        public virtual ICollection<SubscriberCategory> SubscriberCategories { get; set; }
    }
}