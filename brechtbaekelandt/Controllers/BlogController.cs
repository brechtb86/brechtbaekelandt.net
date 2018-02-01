using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using brechtbaekelandt.Data;
using brechtbaekelandt.Identity;
using Microsoft.AspNetCore.Mvc;

namespace brechtbaekelandt.Controllers
{
    public class BlogController : BaseController
    {
        private readonly BlogDbContext _blogDbContext;

        private readonly ApplicationUserManager _applicationUserManager;

        public BlogController(BlogDbContext blogDbContext, ApplicationUserManager applicationUserManager) : base(applicationUserManager)
        {
            this._blogDbContext = blogDbContext;
            this._applicationUserManager = applicationUserManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Post()
        {
            return View();
        }
    }
}