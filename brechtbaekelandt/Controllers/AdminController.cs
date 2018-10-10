using AutoMapper;
using brechtbaekelandt.Data.Contexts;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Models;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Controllers
{
    public class AdminController : BaseController
    {
        private readonly BlogDbContext _blogDbContext;

        private readonly ApplicationUserManager _applicationUserManager;

        private const int _postsPerPage = 5;

        public AdminController(BlogDbContext blogDbContext, ApplicationUserManager applicationUserManager) : base(applicationUserManager)
        {
            this._blogDbContext = blogDbContext;
            this._applicationUserManager = applicationUserManager;
        }

        public async Task<IActionResult> Index()
        {
            var viewModel = new AdminViewModel
            {
                Posts = Mapper.Map<ICollection<Post>>(this._blogDbContext.Posts.Include(p => p.User).Include(p => p.Attachments).Include(p => p.PostCategories).ThenInclude(pc => pc.Category).OrderByDescending(p => p.Created)),
                Categories = Mapper.Map<ICollection<Models.Category>>(this._blogDbContext.Categories).OrderBy(c => c.Name).ToCollection(),
                Users = Mapper.Map<ICollection<Models.User>>(this._blogDbContext.Users.ToCollection()),
                CurrentUser = Mapper.Map<User>(await this._applicationUserManager.FindByNameAsync(HttpContext.User?.Identity.Name))
            };

            return View(viewModel);
        }
    }
}