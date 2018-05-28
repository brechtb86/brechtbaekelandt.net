using System.Collections.Generic;
using System.Threading.Tasks;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.Services
{
    public interface IEmailService
    {
        string TemplateRootPath { get; set; }

        Task SendSubscribedEmailAsync(string subscriberEmailAddress, string confirmationLink, ICollection<Category> categories);
    }
}
