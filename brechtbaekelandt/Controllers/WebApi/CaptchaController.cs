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

        [HttpGet]
        public IActionResult GetCaptchaActionResult(string captchaName)
        {
            var newCaptcha = this._captchaHelper.CreateNewCaptcha(5);
            var newCaptchaImage = this._captchaHelper.CreateCaptchaImage(newCaptcha);

            this.SetCaptcha(newCaptcha, captchaName);

            return this.Ok(newCaptchaImage);
        }

        [HttpPost]
        [Route("delete")]
        public IActionResult DeleteCaptchaActionResult(string captchaName)
        {
            this.DeleteCaptcha(captchaName);

            return this.Ok();
        }

        private void SetCaptcha(Captcha captcha, string captchaName)
        {
            this.Response.Cookies.Append(captchaName, JsonConvert.SerializeObject(captcha, Formatting.None, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
        }

        private void DeleteCaptcha(string captchaName)
        {
            this.Response.Cookies.Delete(captchaName);
        }
    }
}