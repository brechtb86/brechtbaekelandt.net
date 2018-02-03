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
        public IActionResult Index(Guid? categoryId = null, string tagsString = "", string searchTermsString = "", int currentPage = 1)
        {
            var searchTerms = !string.IsNullOrEmpty(searchTermsString) ? searchTermsString.Split(',') : new string[0];
            var tags = !string.IsNullOrEmpty(tagsString) ? tagsString.Split(',') : new string[0];

            var query = this._blogDbContext.Posts
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Include(p => p.PostCategories)
                .ThenInclude(pc => pc.Category)
                .Where(p =>
                    (categoryId == null || p.PostCategories.Any(pc => pc.CategoryId == categoryId)) &&
                    (searchTerms.Length == 0 || searchTerms.Any(s => p.Title.ToLower().Contains(s.ToLower())) ||
                     searchTerms.Length == 0 || searchTerms.Any(s => p.Description.ToLower().Contains(s.ToLower())) ||
                     searchTerms.Length == 0 || searchTerms.Any(s => string.IsNullOrEmpty(p.Content) || p.Content.ToLower().Contains(s.ToLower()))) &&
                    (tags.Length == 0 || tags.Any(t => string.IsNullOrEmpty(p.Tags) || p.Tags.ToLower().Contains(t.ToLower())))
                )
                .OrderByDescending(p => p.Created)
                .Skip((currentPage - 1) * _postsPerPage)
                .Take(_postsPerPage);

            var totalPostCount = this._blogDbContext.Posts.Count();

            var categoryEntities = this._blogDbContext.Categories
                .OrderBy(c => c.Name);

            var allTags = this._blogDbContext.Posts
                .SelectMany(post => !string.IsNullOrEmpty(post.Tags) ? post.Tags.Split(",", StringSplitOptions.None) : new string[0]).Distinct().ToArray();

            var vm = new HomeViewModel
            {
                CurrentPage = currentPage,
                TotalPostCount = totalPostCount,
                PostsPerPage = _postsPerPage,
                Posts = Mapper.Map<ICollection<Models.Post>>(query),
                Categories = Mapper.Map<ICollection<Models.Category>>(categoryEntities),
                Tags = allTags,
                SearchTermsFilter = searchTerms,
                TagsFilter = tags,
                CategoryIdFilter = categoryId
            };

            return this.View(vm);
        }
    }
}
