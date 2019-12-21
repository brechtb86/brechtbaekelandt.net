using brechtbaekelandt.Identity;
using brechtbaekelandt.ViewModels;
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

        [HttpGet]
        public IActionResult Index()
        {
            var vm = new AboutViewModel();

            return this.View(vm);
        }
    }
}