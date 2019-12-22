using System;
using System.Collections.Generic;
using System.Globalization;
using AutoMapper;
using brechtbaekelandt.Data.Contexts;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Helpers;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Models;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace brechtbaekelandt.Controllers
{
    [Route("blog")]
    public class BlogController : BaseController
    {
        private readonly BlogDbContext _blogDbContext;

        public BlogController(BlogDbContext blogDbContext, ApplicationUserManager applicationUserManager) : base(applicationUserManager)
        {
            this._blogDbContext = blogDbContext;
        }
        
        [HttpGet("post/{internalTitle}")]
        public async Task<IActionResult> Post(string internalTitle, string[] searchTerms = null)
        {
            var postEntity = await this._blogDbContext.Posts
                .Include(p => p.User)
                .Include(p => p.Attachments)
                .Include(p => p.Comments)
                .Include(p => p.PostCategories)
                .ThenInclude(pc => pc.Category)
                .FirstOrDefaultAsync(p => p.InternalTitle == internalTitle);

            if (postEntity == null)
            {
                return this.NotFound("this post was not found.");
            }

            postEntity.Comments = postEntity.Comments.OrderByDescending(c => c.Created).ToCollection();

            var vm = new PostViewModel
            {
                Post = Mapper.Map<Post>(postEntity),
                SearchTermsFilter = searchTerms
            };

            return this.View(vm);
        }

        [HttpGet("archive")]
        public async Task<IActionResult> Archive()
        {
            var postEntities = this._blogDbContext.Posts.Where(p => p.IsPostVisible).GroupBy(p => new {p.Created.Year, p.Created.Month});

            var groupedPosts = postEntities.OrderByDescending(g => new DateTime(g.Key.Year, g.Key.Month, 1)).Select(g => new KeyValuePair<string,ICollection<ArchivedPost>>(new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy", CultureInfo.InvariantCulture), Mapper.Map<ICollection<ArchivedPost>>(g.OrderByDescending(p => p.Created).ToCollection()))).ToCollection();

            var vm = new ArchiveViewModel
            {
                ArchivedPosts = groupedPosts
            };

            return this.View(vm);
        }

        [HttpGet("sitemap")]
        public IActionResult Sitemap()
        {
            var doc = new XmlDocument();

            var rootElement = doc.CreateElement("urlset");
            rootElement.SetAttribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");
            rootElement.SetAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
            rootElement.SetAttribute("xsi:schemaLocation",
                "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd");

            var postEntities = this._blogDbContext.Posts.ToCollection();

            foreach (var postEntity in postEntities)
            {
                var urlElement = doc.CreateElement("url");

                var locationElement = doc.CreateElement("loc");
                locationElement.InnerText = $"{BaseUrl}/blog/post/{postEntity.InternalTitle}";

                var lastModifiedElement = doc.CreateElement("lastmod");
                lastModifiedElement.InnerText = postEntity.LastModified != null ? postEntity.LastModified.Value.ToString("yyyy-MM-ddTHH:mm:sszzz") : postEntity.Created.ToString("yyyy-MM-ddTHH:mm:sszzz");

                var priorityElement = doc.CreateElement("priority");
                priorityElement.InnerText = "0.90";

                urlElement.AppendChild(locationElement);
                urlElement.AppendChild(lastModifiedElement);
                urlElement.AppendChild(priorityElement);

                rootElement.AppendChild(urlElement);
            }

            doc.AppendChild(rootElement);

            return this.Content(doc.OuterXml, "application/xml");
        }
    }
}