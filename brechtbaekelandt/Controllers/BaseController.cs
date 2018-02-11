using System.Threading.Tasks;
using AutoMapper;
using brechtbaekelandt.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace brechtbaekelandt.Controllers
{
    public class BaseController : Controller
    {
        private readonly ApplicationUserManager _userManager;

        private readonly string[] _keywords =
        {
            "Brecht Baekelandt", "developer", "software", "web application", "web app", "webdesigner", "front-end",
            "frontend", "back-end", "backend", ".net", "c#", "javascript", "angular", "knockout", "mvc", "asp.net"
        };

        public BaseController(
            ApplicationUserManager userManager)
        {
            this._userManager = userManager;

        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                Task
                    .Run(async () =>
                    {
                        this.ViewData["CurrentUser"] =
                            Mapper.Map<Models.ApplicationUser>(await this._userManager.FindByNameAsync(HttpContext.User?.Identity.Name));
                    })
                    .Wait();
            }

            this.ViewData["Keywords"] = this._keywords;

            base.OnActionExecuted(context);

        }
    }
}
