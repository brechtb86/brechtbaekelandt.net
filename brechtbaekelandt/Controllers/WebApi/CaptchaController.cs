using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using brechtbaekelandt.Helpers;
using brechtbaekelandt.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace brechtbaekelandt.Controllers.WebApi
{
    [Produces("application/json")]
    [Route("api/captcha")]
    public class CaptchaController : Controller
    {
        private readonly CaptchaHelper _captchaHelper;

        public CaptchaController(CaptchaHelper captchaHelper)
        {
            this._captchaHelper = captchaHelper;
        }

        public IActionResult GetCaptcha()
        {
            var newCaptcha = this._captchaHelper.CreateNewCaptcha(5);
            var newCaptchaImage = this._captchaHelper.CreateCaptchaImage(newCaptcha);

            this.SetCaptcha(newCaptcha);

            return this.Ok(newCaptchaImage);
        }

        private void SetCaptcha(Captcha captcha)
        {
            this.Response.Cookies.Append("captcha", JsonConvert.SerializeObject(captcha, Formatting.None, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
        }
    }
}