using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutoMapper;
using brechtbaekelandt.Data;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Identity;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace brechtbaekelandt.Controllers
{
    public class HomeController : BaseController
    {
        private readonly BlogDbContext _blogDbContext;

        private readonly ApplicationUserManager _applicationUserManager;

        private const int PostsPerPage = 5;

        public HomeController(BlogDbContext blogDbContext, ApplicationUserManager applicationUserManager) : base(applicationUserManager)
        {
            this._blogDbContext = blogDbContext;
            this._applicationUserManager = applicationUserManager;
        }

        [HttpGet]
        public IActionResult Index(Guid? categoryId = null, string categoryName = null, string[] searchTerms = null, string[] tags = null, int currentPage = 1, bool includeComments = true)
        {
            var postEntities = this._blogDbContext.Posts
                .Include(p => p.User)
                .Include(p => p.Attachments)
                .Include(p => p.PostCategories)
                .ThenInclude(pc => pc.Category)
                .Where(p =>
                    (categoryId == null ||
                     p.PostCategories.Any(pc => pc.Category.Id == categoryId)) &&
                    (categoryName == null ||
                     p.PostCategories.Any(pc => pc.Category.Name == categoryName)) &&
                    (searchTerms == null ||
                     searchTerms.Length == 0 ||
                     searchTerms[0] == null ||
                     searchTerms.Any(s => Regex.Replace(p.Title, "<.*?>", string.Empty).ToLower().Contains(s.ToLower())) ||
                     searchTerms.Any(s => Regex.Replace(p.Description, "<.*?>", string.Empty).ToLower().Contains(s.ToLower())) ||
                     searchTerms.Any(s => !string.IsNullOrEmpty(p.Content) && Regex.Replace(p.Content, "<.*?>", string.Empty).ToLower().Contains(s.ToLower()))) &&
                    (tags == null ||
                     tags.Length == 0 ||
                     tags[0] == null ||
                     tags.Any(t => !string.IsNullOrEmpty(p.Tags) && p.Tags.Contains(t))) &&
                    p.IsPostVisible
                );

            if (includeComments)
            {
                postEntities = postEntities.Include(p => p.Comments);
            }

            var totalPostCount = postEntities.Count();

            postEntities = postEntities.OrderByDescending(p => p.Created)
                .Skip((currentPage - 1) * PostsPerPage)
                .Take(PostsPerPage);

            if (includeComments)
            {
                foreach (var postEntity in postEntities)
                {
                    postEntity.Comments = postEntity.Comments.OrderByDescending(c => c.Created).ToCollection();
                }
            }

            var categoryEntities = this._blogDbContext.Categories
                .OrderBy(c => c.Name);

            var allTags = this._blogDbContext.Posts
                .SelectMany(post => !string.IsNullOrEmpty(post.Tags) ? post.Tags.Split(",", StringSplitOptions.None) : new string[0]).Distinct().ToArray();

            var vm = new HomeViewModel
            {
                CurrentPage = currentPage,
                TotalPostCount = totalPostCount,
                PostsPerPage = PostsPerPage,
                Posts = Mapper.Map<ICollection<Models.Post>>(postEntities.ToCollection()),
                Categories = Mapper.Map<ICollection<Models.Category>>(categoryEntities.ToCollection()),
                Tags = allTags,
                SearchTermsFilter = searchTerms,
                TagsFilter = tags,
                CategoryIdFilter = categoryId
            };

            return this.View(vm);
        }
    }
}
