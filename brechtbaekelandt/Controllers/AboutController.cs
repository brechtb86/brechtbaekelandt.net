using brechtbaekelandt.Identity;
using Microsoft.AspNetCore.Mvc;

namespace brechtbaekelandt.Controllers
{
    public class AboutController : BaseController
    {
        private readonly ApplicationUserManager _applicationUserManager;

        public AboutController(ApplicationUserManager applicationUserManager) : base(applicationUserManager)
        {
            this._applicationUserManager = applicationUserManager;
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}