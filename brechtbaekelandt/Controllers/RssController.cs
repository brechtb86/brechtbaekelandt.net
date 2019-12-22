using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using brechtbaekelandt.Data.Contexts;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

namespace brechtbaekelandt.Controllers
{
    [Produces("application/xml")]
    public class RssController : BaseController
    {
        private readonly BlogDbContext _blogDbContext;

        public RssController(ApplicationUserManager userManager, BlogDbContext blogDbContext) : base(userManager)
        {
            this._blogDbContext = blogDbContext;
        }

        [HttpGet]
        public IActionResult Index(string categories = null)
        {
            var rss = new Rss
            {
                Channel = new RssChannel
                {
                    Title = "blog - brecht|baekelandt",
                    Link = this.BaseUrl,
                    Items = new List<RssChannelItem>()
                }
            };

            var categoryNames = string.IsNullOrEmpty(categories) ?
                this._blogDbContext.Categories.Select(category => category.Name)
                    .OrderBy(categoryName => categoryName) :
                this._blogDbContext.Categories.Select(category => category.Name)
                    .OrderBy(categoryName => categoryName)
                    .Where(categoryName => categories
                        .Split(",",StringSplitOptions.RemoveEmptyEntries)
                        .Select(HttpUtility.UrlDecode)
                        .Contains(categoryName));

            rss.Channel.Description = $"blog posts for categories '{categoryNames.OrderBy(categoryName => categoryName).Join(", ")}'";

            foreach (var categoryName in categoryNames)
            {
                var categoryEntity = this._blogDbContext.Categories
                    .Include(category => category.PostCategories)
                    .ThenInclude(postCategory => postCategory.Post)
                    .ThenInclude(post => post.User)
                    .FirstOrDefault(category => category.Name == categoryName);

                if (categoryEntity == null)
                {
                    continue;
                }

                foreach (var postEntity in categoryEntity.PostCategories.Select(postCategory => postCategory.Post).OrderByDescending(post => post.Created).Distinct().Where(post => post.IsPostVisible))
                {
                    var post = Mapper.Map<Post>(postEntity);

                    var rssItem = new RssChannelItem
                    {
                        Category = categoryName,
                        Guid = post.InternalTitle,
                        Title = post.Title,
                        Description = post.CleanDescription,
                        Link = $"{this.BaseUrl}{post.Url}",
                        PublicationDate = post.Created,
                        Author = post.User.FullName
                    };

                    rss.Channel.Items.Add(rssItem);
                }
            }

            return this.Ok(rss);
        }
    }
}