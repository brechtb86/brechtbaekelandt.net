using System.Linq;
using brechtbaekelandt.Helpers;
using brechtbaekelandt.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace brechtbaekelandt.Filters
{
    public class ValidateCaptchaAttribute : ActionFilterAttribute
    {
        private readonly string _captchaName;

        private readonly CaptchaHelper _captchaHelper;

        public ValidateCaptchaAttribute(string captchaName)
        {
            this._captchaName = captchaName;
            this._captchaHelper = new CaptchaHelper();
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var captchaJson = context.HttpContext.Request.Cookies[this._captchaName];

            var captchaAttemptedValue = context.HttpContext.Request.Headers["captchaAttemptedValue"].FirstOrDefault();

            if (string.IsNullOrEmpty(captchaJson) || string.IsNullOrEmpty(captchaAttemptedValue))
            {
                context.Result =
                    new BadRequestObjectResult(new { error = "noCaptcha", errorMessage = "you must provide a captcha!" });

                return;

            }

            var validatedCaptcha = this._captchaHelper.ValidateCaptcha(JsonConvert.DeserializeObject<Captcha>(captchaJson), captchaAttemptedValue);

            if (validatedCaptcha.AttemptFailed)
            {
                context.Result =
                    new BadRequestObjectResult(new { error = "invalidCaptcha", errorMessage = validatedCaptcha.AttemptFailedMessage });

                context.HttpContext.Response.Cookies.Append(this._captchaName, JsonConvert.SerializeObject(validatedCaptcha, Formatting.None, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() }));

                return;
            }

            context.HttpContext.Response.Cookies.Delete(this._captchaName);

            return;
        }
    }
}
