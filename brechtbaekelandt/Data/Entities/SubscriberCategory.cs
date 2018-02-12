using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Data.Entities
{
    public class SubscriberCategory
    {
        public Guid subscriberId { get; set; }
        public Subscriber Subscriber { get; set; }

        public Guid CategoryId { get; set; }
        public Category Category { get; set; }
    }
}
