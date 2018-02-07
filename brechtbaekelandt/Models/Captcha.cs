using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Models
{
    public class Captcha
    {
        public string ValueString { get; set; }

        public bool AttemptSucceeded { get; set; }

        public bool AttemptFailed { get; set; }

        public string AttemptFailedMessage { get; set; }
    }
}
