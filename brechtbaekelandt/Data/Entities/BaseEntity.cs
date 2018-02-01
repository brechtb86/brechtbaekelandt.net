using System;

namespace brechtbaekelandt.Data.Entities
{
    public abstract class BaseEntity
    {
        public Guid Id { get; set; }
    }
}