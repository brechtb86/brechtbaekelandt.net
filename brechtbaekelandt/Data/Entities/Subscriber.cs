using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Data.Entities
{
    public class Subscriber : BaseEntity
    {
        public string EmailAddress { get; set; }

        public virtual ICollection<SubscriberCategory> SubscriberCategories { get; set; }
    }
}
