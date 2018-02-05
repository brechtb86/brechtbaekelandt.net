using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Data.Entities
{
    public class Attachment : BaseEntity
    {
        public string Name { get; set; }

        public string Url { get; set; }

        public long Size { get; set; }

        public virtual Post Post { get; set; }
    }
}
