using System.Collections.Generic;

namespace brechtbaekelandt.Data.Entities
{
    public class Subscriber : BaseEntity
    {
        public string EmailAddress { get; set; }

        public virtual ICollection<SubscriberCategory> SubscriberCategories { get; set; }
    }
}
