using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Models
{
    public class Subscriber : Base
    {
        public string EmailAddress { get; set; }

        public ICollection<Category> Categories { get; set; }
    }
}
