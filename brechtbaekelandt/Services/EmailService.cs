using brechtbaekelandt.Settings;
using Mailjet.Client;
using Mailjet.Client.Resources;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Threading.Tasks;

namespace brechtbaekelandt.Services
{
    public class SubscribedData
    {
        public string SubscriberEmailAddress { get; set; }

        public string ConfirmationLink { get; set; }
    }

    public class EmailService : IEmailService
    {
        private readonly MailjetSettings _mailjetSettings;

        public string TemplateRootPath { get; set; }

        public EmailService(IOptions<MailjetSettings> mailjetSettingsOptions)
        {
            this._mailjetSettings = mailjetSettingsOptions.Value;
        }

        public async Task SendSubscribedEmailAsync(string subscriberEmailAddress, string confirmationLink)
        {
            var data = new SubscribedData
            {
                ConfirmationLink = confirmationLink,
                SubscriberEmailAddress = subscriberEmailAddress
            };

            var emailHtmString = await this.ParseSubscribedHtmlEmail("subscribed", data);
            //var emailTextString = await this.ParseTextEmail("subscribed", data);

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
                        {"Email", this._mailjetSettings.From},
                        {"Name",  this._mailjetSettings.FromName}
                    }},
                    {"To", new JArray {
                        new JObject {
                            {"Email", subscriberEmailAddress},
                            {"Name", subscriberEmailAddress}
                        }
                    }},
                    {"Subject", ""},
                    {"TextPart", ""},
                    {"HTMLPart", emailHtmString}
                }
            });

            var response = await client.PostAsync(request);
        }


        private async Task<string> ParseSubscribedHtmlEmail(string templateName, SubscribedData data)
        {
            var htmlString = await File.ReadAllTextAsync(Path.Combine(this.TemplateRootPath, $@"EmailTemplates\{templateName}.html"));

            var parsedHtmlString = htmlString.Replace("%%confirmationLink%%", data.ConfirmationLink);
            parsedHtmlString = parsedHtmlString.Replace("%%subscriberEmailAddress%%", data.SubscriberEmailAddress);

            return parsedHtmlString;
        }

        private async Task<string> ParseTextEmail(string templateName, params string[] parameters)
        {
            var textString = await File.ReadAllTextAsync(Path.Combine(this.TemplateRootPath, $@"EmailTemplates\{templateName}.txt"));

            return string.Format(textString, parameters);
        }
    }
}
