using brechtbaekelandt.Models;
using brechtbaekelandt.Settings;
using Mailjet.Client;
using Mailjet.Client.Resources;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace brechtbaekelandt.Services
{
    public class SubscribedData
    {
        public string SubscriberEmailAddress { get; set; }

        public string ConfirmationLink { get; set; }

        public ICollection<Category> Categories { get; set; }
    }

    public class EmailService : IEmailService
    {
        private readonly MailjetSettings _mailjetSettings;

        public string TemplateRootPath { get; set; }

        public EmailService(IOptions<MailjetSettings> mailjetSettingsOptions)
        {
            this._mailjetSettings = mailjetSettingsOptions.Value;
        }

        public async Task<EmailResponse> SendEmailAsync(string fromName, string fromEmailAddress, string toName, string toEmailAddress, string subject, string emailHtmlString, string emailTextString = null)
        {
            var client = new MailjetClient(this._mailjetSettings.ApiKey, this._mailjetSettings.ApiSecret, new MailjetClientHandler())
            {
                BaseAdress = this._mailjetSettings.BaseAddress,
                Version = ApiVersion.V3_1
            };

            var request = new MailjetRequest
            {
                Resource = Send.Resource
            }
                .Property(Send.Messages, new JArray {
                    new JObject {
                        {"From", new JObject {
                            {"Email", fromEmailAddress},
                            {"Name",  fromName}
                        }},
                        {"To", new JArray {
                            new JObject {
                                {"Email", toEmailAddress},
                                {"Name", toName}
                            }
                        }},
                        {"Subject", subject},
                        {"TextPart", !string.IsNullOrEmpty(emailTextString) ? emailTextString: "This email is HTML only."},
                        {"HTMLPart", emailHtmlString}
                    }
                });

            var response = await client.PostAsync(request);

            return new EmailResponse
            {
                IsSuccess = response.IsSuccessStatusCode
            };
        }

        public async Task SendSubscribedEmailAsync(string subscriberEmailAddress, string confirmationLink, ICollection<Category> categories)
        {
            var data = new SubscribedData
            {
                ConfirmationLink = confirmationLink,
                SubscriberEmailAddress = subscriberEmailAddress,
                Categories = categories
            };

            var emailHtmlString = await this.ParseSubscribedHtmlEmailAsync("subscribed", data);
            var emailTextString = await this.ParseTextEmailAsync("subscribed", data);

            await this.SendEmailAsync(this._mailjetSettings.NewsletterFromName, this._mailjetSettings.NewsletterFrom, subscriberEmailAddress, subscriberEmailAddress, "You have subscribed to brechtbaekelandt.net!", emailHtmlString, emailTextString);
        }

        public async Task SendCommentNotificationEmailAsync(string commentorName, string commentorEmailAddress, string commentTitle, string comment)
        {
            var commentNotificationEmailBodyStringBuilder = new StringBuilder();
            commentNotificationEmailBodyStringBuilder.Append($"<h4>You have a new comment from {commentorName} {(!string.IsNullOrEmpty(commentorEmailAddress) ? $"({commentorEmailAddress})" : string.Empty)}</h4>");
            commentNotificationEmailBodyStringBuilder.Append($"<u>{(!string.IsNullOrEmpty(commentTitle) ? commentTitle : string.Empty)}</u>");
            commentNotificationEmailBodyStringBuilder.Append($"<p>{comment}</p>");

            var emailHtmlString = commentNotificationEmailBodyStringBuilder.ToString();

            await this.SendEmailAsync(this._mailjetSettings.FromName, this._mailjetSettings.From, "Brecht Baekelandt", "brecht.baekelandt@outlook.com", $"New blog comment {(!string.IsNullOrEmpty(commentTitle) ? $": {commentTitle}" : string.Empty)}", emailHtmlString);
        }

        private async Task<string> ParseSubscribedHtmlEmailAsync(string templateName, SubscribedData data)
        {
            var htmlString = await File.ReadAllTextAsync(Path.Combine(this.TemplateRootPath, $@"EmailTemplates\{templateName}.html"));

            var parsedHtmlString = htmlString.Replace("%%confirmationLink%%", data.ConfirmationLink);
            parsedHtmlString = parsedHtmlString.Replace("%%subscriberEmailAddress%%", data.SubscriberEmailAddress);

            var categoriesStringBuilder = new StringBuilder();
            categoriesStringBuilder.Append("<ul>");
            data.Categories.ToList().ForEach((c) => { categoriesStringBuilder.Append($"<li>{c.Name}</li>"); });
            categoriesStringBuilder.Append("</ul>");

            parsedHtmlString = parsedHtmlString.Replace("%%categories%%", categoriesStringBuilder.ToString());

            return parsedHtmlString;
        }

        private async Task<string> ParseTextEmailAsync(string templateName, params object[] parameters)
        {
            var textString = await File.ReadAllTextAsync(Path.Combine(this.TemplateRootPath, $@"EmailTemplates\{templateName}.txt"));

            return parameters != null ? string.Format(textString, parameters) : string.Empty;
        }
    }
}
