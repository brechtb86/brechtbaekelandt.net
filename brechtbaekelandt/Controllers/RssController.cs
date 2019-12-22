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
    [Route("rss")]
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
                Version = "2.0",
                Channel = new RssChannel
                {

                    Title = "blog - brecht|baekelandt",
                    Link = this.BaseUrl,
                    Language = "en-US",
                    Items = new List<RssChannelItem>()
                }
            };
            
            var categoryNames = string.IsNullOrEmpty(categories) ?
                this._blogDbContext.Categories.Select(category => category.Name) :
                this._blogDbContext.Categories.Select(category => category.Name)
                    .Where(categoryName => categories
                        .Split(",",StringSplitOptions.RemoveEmptyEntries)
                        .Select(HttpUtility.UrlDecode)
                        .Contains(categoryName));

            rss.Channel.Description = $"blog posts for categories '{categoryNames.OrderBy(categoryName => categoryName).Join(", ")}'";

            var postEntities = this._blogDbContext.Posts
                .Include(post => post.User)
                .Include(post => post.PostCategories)
                .ThenInclude(postCategory => postCategory.Category)
                .Where(post => post.PostCategories.Select(postCategory => postCategory.Category.Name).Any(categoryName => categoryNames.Contains(categoryName)))
                .OrderByDescending(post => post.Created);
            
                foreach (var postEntity in postEntities)
                {
                    var post = Mapper.Map<Post>(postEntity);

                    var rssItem = new RssChannelItem
                    {
                        Category = post.Categories.Select(category => category.Name).OrderBy(categoryName => categoryName).Join(", "),
                        Guid = post.InternalTitle,
                        Title = post.Title,
                        Description = post.CleanDescription,
                        Link = $"{this.BaseUrl}{post.Url}",
                        PublicationDate = post.Created,
                        Author = post.User.FullName
                    };

                    rss.Channel.Items.Add(rssItem);
                }
            

            return this.Ok(rss);
        }
    }
}