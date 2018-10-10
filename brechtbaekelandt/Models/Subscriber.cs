using System;
using System.Collections.Generic;

namespace brechtbaekelandt.Models
{
    [Serializable]
    public class Subscriber : Base
    {
        public string EmailAddress { get; set; }

        public ICollection<Category> Categories { get; set; }
    }
}
