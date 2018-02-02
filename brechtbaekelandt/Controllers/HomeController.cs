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
        public IActionResult Index(Guid? categoryId = null, string tag = "", int currentPage = 1)
        {
            var query = this._blogDbContext.Posts
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Include(p => p.PostCategories)
                .ThenInclude(pc => pc.Category)
                .Where(
                    p => p.PostCategories.Any(pc =>
                        (categoryId == null || categoryId == Guid.Empty || pc.Category.Id == categoryId)
                        && (string.IsNullOrEmpty(tag) || p.Tags.Contains(tag))
                    ))
                .OrderByDescending(p => p.Created)
                .Skip((currentPage - 1) * _postsPerPage)
                .Take(_postsPerPage);

            var totalPostCount = this._blogDbContext.Posts.Count();

            var categoryEntities = this._blogDbContext.Categories
                .OrderBy(c => c.Name);

            var tags = this._blogDbContext.Posts
                .SelectMany(post => !string.IsNullOrEmpty(post.Tags) ? post.Tags.Split(",", StringSplitOptions.None) : new string[0]).Distinct().ToArray();

            var vm = new HomeViewModel
            {
                CurrentPage = currentPage,
                TotalPostCount = totalPostCount,
                PostsPerPage = _postsPerPage,
                Posts = Mapper.Map<ICollection<Models.Post>>(query),
                Categories = Mapper.Map<ICollection<Models.Category>>(categoryEntities),
                Tags = tags,
                TagsFilter = !string.IsNullOrEmpty(tag) ? new[] { tag } : new string[0],
                CategoryIdFilter = !(categoryId == null || categoryId == Guid.Empty) ? categoryId : null
            };

            return this.View(vm);
        }
    }
}
