using System;

namespace brechtbaekelandt.Models
{
    [Serializable]
    public class CaptchaValue
    {
        public string Value { get; set; }

        public DateTime FirstTimeAttempted { get; set; }

        public DateTime LastTimeAttempted { get; set; }

        public int NumberOfTimesAttempted { get; set; }
    }
}
