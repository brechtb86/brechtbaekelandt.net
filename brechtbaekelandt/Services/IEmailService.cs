using System.Threading.Tasks;

namespace brechtbaekelandt.Services
{
    public interface IEmailService
    {
        string TemplateRootPath { get; set; }

        Task SendSubscribedEmailAsync(string subscriberEmailAddress);
    }
}
