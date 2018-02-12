using System;

namespace brechtbaekelandt.Models
{
    [Serializable]
    public abstract class Base
    {
        public Guid Id { get; set; }
    }
}