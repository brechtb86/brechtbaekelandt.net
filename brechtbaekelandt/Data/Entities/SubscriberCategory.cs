using System;

namespace brechtbaekelandt.Data.Entities
{
    public class SubscriberCategory
    {
        public Guid SubscriberId { get; set; }
        public Subscriber Subscriber { get; set; }

        public Guid CategoryId { get; set; }
        public Category Category { get; set; }
    }
}
