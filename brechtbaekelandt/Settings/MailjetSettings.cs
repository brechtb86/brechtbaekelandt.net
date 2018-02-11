using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Settings
{
    public class MailjetSettings
    {
        public string ApiKey { get; set; }

        public string ApiSecret { get; set; }

        public string BaseAddress { get; set; }

        public string From { get; set; }

        public string FromName { get; set; }
    }
}
