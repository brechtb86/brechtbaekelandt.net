using brechtbaekelandt.Settings;
using Mailjet.Client;
using Mailjet.Client.Resources;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Services
{
    public class EmailService : IEmailService
    {
        private readonly MailjetSettings _mailjetSettings;

        public EmailService(IOptions<MailjetSettings> mailjetSettingsOptions)
        {
            this._mailjetSettings = mailjetSettingsOptions.Value;
        }

        public async Task SendSubscribedEmailAsync(string subscriberEmailAddress)
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
                    {"HTMLPart", ""}
                }
            });

            var response = await client.PostAsync(request);
        }


    }
}
