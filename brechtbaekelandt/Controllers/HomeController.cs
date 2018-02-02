using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using brechtbaekelandt.Data;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Identity.Models;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace brechtbaekelandt.Controllers
{
    public class HomeController : BaseController
    {
        private readonly BlogDbContext _blogDbContext;

        private readonly ApplicationUserManager _applicationUserManager;

        private const int _postsPerPage = 5;

        public HomeController(BlogDbContext blogDbContext, ApplicationUserManager applicationUserManager) : base(applicationUserManager)
        {
            this._blogDbContext = blogDbContext;
            this._applicationUserManager = applicationUserManager;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var totalPostCount = this._blogDbContext.Posts.Count();

            var postEntities = this._blogDbContext.Posts
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Include(p => p.PostCategories)
                .ThenInclude(pc => pc.Category)
                .OrderByDescending(p => p.Created).Take(_postsPerPage);

            var categoryEntities = this._blogDbContext.Categories
                .OrderBy(c => c.Name);

            var keywords = this._blogDbContext.Posts
                .SelectMany(post => !string.IsNullOrEmpty(post.Keywords) ? post.Keywords.Split(",", StringSplitOptions.None) : new string[0]).Distinct().ToArray();

            var vm = new HomeViewModel
            {
                TotalPostCount = totalPostCount,
                PostsPerPage = _postsPerPage,
                Posts = Mapper.Map<ICollection<Models.Post>>(postEntities),
                Categories = Mapper.Map<ICollection<Models.Category>>(categoryEntities),
                Keywords = keywords
            };

            return this.View(vm);
        }
    }
}
