using AutoMapper;
using brechtbaekelandt.Data.Contexts;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Identity;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Xml;

namespace brechtbaekelandt.Controllers
{
    public class HomeController : BaseController
    {
        private readonly BlogDbContext _blogDbContext;

        private const string BaseUrl = "https://www.brechtbaekelandt.net";

        private const int PostsPerPage = 5;

        public HomeController(BlogDbContext blogDbContext, ApplicationUserManager applicationUserManager) : base(applicationUserManager)
        {
            this._blogDbContext = blogDbContext;
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
            var allPostsUrls = postEntities.Select(p => $"{BaseUrl}/blog/post/{p.InternalTitle}").ToCollection();


            postEntities = postEntities.OrderByDescending(p => p.Created)
                .Take(PostsPerPage * currentPage);

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
                AllPostsUrls = allPostsUrls,
                Posts = Mapper.Map<ICollection<Models.Post>>(postEntities.ToCollection()),
                Categories = Mapper.Map<ICollection<Models.Category>>(categoryEntities.ToCollection()),
                Tags = allTags,
                SearchTermsFilter = searchTerms,
                TagsFilter = tags,
                CategoryIdFilter = categoryId
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

            var homeUrlElement = doc.CreateElement("url");

            var homeLocationElement = doc.CreateElement("loc");
            homeLocationElement.InnerText = $"https://www.brechtbaekelandt.net/";
            var homeLastModifiedElement = doc.CreateElement("lastmod");
            homeLastModifiedElement.InnerText = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:sszzz");
            var homePriorityElement = doc.CreateElement("priority");
            homePriorityElement.InnerText = "0.90";
            var homeChangeFrequencyElement = doc.CreateElement("changefreq");
            homeChangeFrequencyElement.InnerText = "always";

            homeUrlElement.AppendChild(homeLocationElement);
            homeUrlElement.AppendChild(homeLastModifiedElement);
            homeUrlElement.AppendChild(homePriorityElement);
            homeUrlElement.AppendChild(homeChangeFrequencyElement);

            rootElement.AppendChild(homeUrlElement);

            var archiveUrlElement = doc.CreateElement("url");

            var archiveLocationElement = doc.CreateElement("loc");
            archiveLocationElement.InnerText = $"https://www.brechtbaekelandt.net/blog/archive";
            var archiveLastModifiedElement = doc.CreateElement("lastmod");
            archiveLastModifiedElement.InnerText = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:sszzz");
            var archivePriorityElement = doc.CreateElement("priority");
            archivePriorityElement.InnerText = "0.75";
            var archiveChangeFrequencyElement = doc.CreateElement("changefreq");
            archiveChangeFrequencyElement.InnerText = "always";

            archiveUrlElement.AppendChild(archiveLocationElement);
            archiveUrlElement.AppendChild(archiveLastModifiedElement);
            archiveUrlElement.AppendChild(archivePriorityElement);
            archiveUrlElement.AppendChild(archiveChangeFrequencyElement);

            rootElement.AppendChild(archiveUrlElement);

            var aboutUrlElement = doc.CreateElement("url");

            var aboutLocationElement = doc.CreateElement("loc");
            aboutLocationElement.InnerText = $"https://www.brechtbaekelandt.net/about";
            var aboutLastModifiedElement = doc.CreateElement("lastmod");
            aboutLastModifiedElement.InnerText = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:sszzz");
            var aboutPriorityElement = doc.CreateElement("priority");
            aboutPriorityElement.InnerText = "0.75";
            var aboutChangeFrequencyElement = doc.CreateElement("changefreq");
            aboutChangeFrequencyElement.InnerText = "never";

            aboutUrlElement.AppendChild(aboutLocationElement);
            aboutUrlElement.AppendChild(aboutLastModifiedElement);
            aboutUrlElement.AppendChild(aboutPriorityElement);
            aboutUrlElement.AppendChild(aboutChangeFrequencyElement);

            rootElement.AppendChild(aboutUrlElement);

            var toolsUrlElement = doc.CreateElement("url");

            var toolsLocationElement = doc.CreateElement("loc");
            toolsLocationElement.InnerText = $"https://www.brechtbaekelandt.net/tools";
            var toolsLastModifiedElement = doc.CreateElement("lastmod");
            toolsLastModifiedElement.InnerText = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:sszzz");
            var toolsPriorityElement = doc.CreateElement("priority");
            toolsPriorityElement.InnerText = "0.75";
            var toolsChangeFrequencyElement = doc.CreateElement("changefreq");
            toolsChangeFrequencyElement.InnerText = "never";

            toolsUrlElement.AppendChild(toolsLocationElement);
            toolsUrlElement.AppendChild(toolsLastModifiedElement);
            toolsUrlElement.AppendChild(toolsPriorityElement);
            toolsUrlElement.AppendChild(toolsChangeFrequencyElement);

            rootElement.AppendChild(toolsUrlElement);

            doc.AppendChild(rootElement);

            return this.Content(doc.OuterXml, "application/xml");
        }
    }
}
