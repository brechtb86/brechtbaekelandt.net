using System.Collections.Generic;
using System.Threading.Tasks;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.Services
{
    public interface IEmailService
    {
        string TemplateRootPath { get; set; }

        Task<EmailResponse> SendEmailAsync(string fromName, string fromEmailAddress, string toName, string toEmailAddress, string subject, string emailHtmlString, string emailTextString = null);

        Task SendSubscribedEmailAsync(string subscriberEmailAddress, string confirmationLink, ICollection<Category> categories);

        Task SendCommentNotificationEmailAsync(string commentorName, string commentorEmailAddress, string commentTitle, string comment, string postTitle);
    }
}
