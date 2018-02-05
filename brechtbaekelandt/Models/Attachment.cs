using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Models
{
    public class Attachment : Base
    {
        public string Name { get; set; }

        public string Url { get; set; }

        public long Size { get; set; }
    }
}
