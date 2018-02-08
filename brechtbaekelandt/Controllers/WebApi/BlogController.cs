using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutoMapper;
using brechtbaekelandt.Data;
using brechtbaekelandt.Data.Entities;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Filters;
using brechtbaekelandt.Helpers;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Models;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Category = brechtbaekelandt.Data.Entities.Category;
using Comment = brechtbaekelandt.Data.Entities.Comment;
using Post = brechtbaekelandt.Data.Entities.Post;
using User = brechtbaekelandt.Data.Entities.User;


namespace brechtbaekelandt.Controllers.WebApi
{
    [Route("api/blog")]
    [Produces("application/json")]
    public class BlogController : Controller
    {
        private readonly BlogDbContext _blogDbContext;

        private readonly ApplicationUserManager _userManager;

        private readonly IHostingEnvironment _hostingEnvironment;

        private const int _postsPerPage = 5;

        private readonly CaptchaHelper _captchaHelper;

        public BlogController(BlogDbContext blogDbcontext, ApplicationUserManager userManager, CaptchaHelper captchaHelper, IHostingEnvironment hostingEnvironment)
        {
            this._userManager = userManager;
            this._blogDbContext = blogDbcontext;
            this._captchaHelper = captchaHelper;
            this._hostingEnvironment = hostingEnvironment;
        }

        [HttpGet]
        [Route("posts")]
        public IActionResult GetPostsAsyncActionResult(Guid? categoryId = null, string categoryName = null, string[] searchTerms = null, string[] tags = null, int currentPage = 1, bool includeComments = true, bool showHidden = false)
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
                    (showHidden || p.IsPostVisible)
                );

            if (includeComments)
            {
                postEntities = postEntities.Include(p => p.Comments);
            }

            var totalPostCount = postEntities.Count();

            postEntities = postEntities.OrderByDescending(p => p.Created)
                .Skip((currentPage - 1) * _postsPerPage)
                .Take(_postsPerPage);

            if (includeComments)
            {
                foreach (var postEntity in postEntities)
                {
                    postEntity.Comments = postEntity.Comments.OrderByDescending(c => c.Created).ToCollection();
                }
            }

            var viewModel = new ApiPostsViewModel
            {
                CurrentPage = currentPage,
                TotalPostCount = totalPostCount,
                PostsPerPage = _postsPerPage,
                Posts = Mapper.Map<ICollection<Models.Post>>(postEntities.ToCollection()),
                SearchTermsFilter = searchTerms,
                TagsFilter = tags,
                CategoryIdFilter = categoryId
            };

            return this.Ok(viewModel);
        }

        [HttpPost]
        [Route("upload-picture")]
        public async Task<IActionResult> UploadPictureAsyncActionResult(IFormFile picture)
        {
            var rootPath = $"{this._hostingEnvironment.WebRootPath}";

            var relativePath = "/images/blog";

            var fullPath = $"{rootPath}{relativePath}";

            var fileName = this.EnsureCorrectFilename(ContentDispositionHeaderValue.Parse(picture.ContentDisposition).FileName.Trim('"'));
            var fileExtension = fileName.Substring(fileName.LastIndexOf('.'));
            var newFileName = $"{Guid.NewGuid()}{fileExtension}";

            var fullFilePath = Path.Combine(fullPath, newFileName);

            using (var stream = new FileStream(fullFilePath, FileMode.Create))
            {
                await picture.CopyToAsync(stream);
            }

            return this.Json($"{relativePath}/{newFileName}");
        }

        [HttpPost]
        [Route("delete-picture")]
        public IActionResult DeletePictureAsyncActionResult(string picture)
        {
            try
            {
                var picturePath = $"{this._hostingEnvironment.WebRootPath}{picture.Replace("/", "\\")}";

                System.IO.File.Delete(picturePath);
            }
            catch (Exception)
            {

            }

            return this.Ok();
        }

        [HttpPost]
        [Route("upload-attachments")]
        public async Task<IActionResult> UploadAttachmentsAsyncActionResult(List<IFormFile> attachments)
        {
            var rootPath = $"{this._hostingEnvironment.WebRootPath}";

            var relativePath = "/attachments/blog";

            var fullPath = $"{rootPath}{relativePath}";

            var results = new Collection<Models.Attachment>();

            foreach (var attachment in attachments)
            {
                var fileName = this.EnsureCorrectFilename(ContentDispositionHeaderValue.Parse(attachment.ContentDisposition).FileName.Trim('"'));

                var fullFilePath = Path.Combine(fullPath, fileName);

                if (attachment.Length <= 0)
                {
                    continue;
                }

                using (var stream = new FileStream(fullFilePath, FileMode.Create))
                {
                    await attachment.CopyToAsync(stream);
                }

                var newAttachement = new Models.Attachment
                {
                    Id = Guid.NewGuid(),
                    Name = fileName,
                    Url = $"{relativePath}/{fileName}",
                    Size = attachment.Length
                };

                results.Add(newAttachement);
            }

            return this.Json(results);
        }

        [HttpPost]
        [Route("delete-attachment")]
        public IActionResult DeleteAttachmentActionResult([FromBody]Models.Attachment attachment)
        {
            var attachmentPath = $"{this._hostingEnvironment.WebRootPath}{attachment.Url.Replace("/", "\\")}";

            System.IO.File.Delete(attachmentPath);

            return this.Json(attachment);
        }

        [HttpPost]
        [Route("post/add")]
        //[ValidationActionFilter]
        public async Task<IActionResult> CreatePostAsyncActionResult([FromBody]Models.Post post)
        {
            post.Id = Guid.NewGuid();
            post.Created = DateTime.Now;

            var postEntity = Mapper.Map<Post>(post);

            var userCurrentUserName = this.HttpContext.User.Identity.Name;

            var userEntity = this._blogDbContext.Users.FirstOrDefault(u => u.UserName == userCurrentUserName) ?? Mapper.Map<User>(await this._userManager.FindByNameAsync(userCurrentUserName));

            postEntity.User = userEntity;

            foreach (var category in post.Categories.Where(c => c.Id == Guid.Empty))
            {
                await this._blogDbContext.Categories.AddAsync(Mapper.Map<Category>(category));
            }

            await this._blogDbContext.SaveChangesAsync();

            postEntity.PostCategories = new Collection<PostCategory>();

            foreach (var category in post.Categories)
            {
                var categoryEntity = this._blogDbContext.Categories.First(c => c.Name == category.Name);

                postEntity.PostCategories.Add(new PostCategory() { CategoryId = categoryEntity.Id });
            }

            await this._blogDbContext.Posts.AddAsync(postEntity);

            await this._blogDbContext.SaveChangesAsync();

            return this.Json(post);
        }

        [HttpPost]
        [Route("post/update")]
        //[ValidationActionFilter]
        public async Task<IActionResult> UpdatePostAsyncActionResult([FromBody]Models.Post post)
        {
            post.LastModified = DateTime.Now;

            var postEntity = Mapper.Map<Post>(post);

            this._blogDbContext.Update(postEntity);

            await this._blogDbContext.SaveChangesAsync();

            return this.Json(Mapper.Map<Models.Post>(postEntity));
        }

        [HttpPost]
        [Route("post/add-comment")]
        [ValidationActionFilter]
        public async Task<IActionResult> CreateCommentAsyncActionResult(Guid postId, string captchaAttemptedValue, [FromBody]Models.Comment comment)
        {
            const string captchaName = "commentCaptcha";

            var captchaJson = this.HttpContext.Request.Cookies[captchaName];

            if (string.IsNullOrEmpty(captchaJson))
            {
                return this.BadRequest(new { error = "noCaptcha" });
            }

            var validatedCaptcha = this._captchaHelper.ValidateCaptcha(JsonConvert.DeserializeObject<Captcha>(captchaJson), captchaAttemptedValue);

            if (validatedCaptcha.AttemptFailed)
            {
                this.SetCaptcha(validatedCaptcha, captchaName);

                return this.BadRequest(new { error = "invalidCaptcha", errorMessage = validatedCaptcha.AttemptFailedMessage });
            }

            var postEntity = await this._blogDbContext.Posts.FirstOrDefaultAsync(p => p.Id == postId);

            if (postEntity == null)
            {
                return this.NotFound($"the post with postID {postId} was not found.");
            }

            comment.Id = Guid.NewGuid();
            comment.Created = DateTime.Now;
            comment.LastModified = DateTime.Now;

            var newCommentEntity = Mapper.Map<Comment>(comment);
            newCommentEntity.Post = postEntity;

            await this._blogDbContext.Comments.AddAsync(newCommentEntity);
            await this._blogDbContext.SaveChangesAsync();

            this.DeleteCaptcha(captchaName);

            return this.Json(comment);
        }

        [HttpPost]
        [Route("post/edit")]
        public IActionResult EditActionResult([FromBody]Post post)
        {
            return null;
        }

        private void SetCaptcha(Captcha captcha, string captchaName)
        {
            this.Response.Cookies.Append(captchaName, JsonConvert.SerializeObject(captcha, Formatting.None, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
        }

        private void DeleteCaptcha(string captchaName)
        {
            this.Response.Cookies.Delete(captchaName);
        }

        private string EnsureCorrectFilename(string filename)
        {
            if (filename.Contains("\\"))
                filename = filename.Substring(filename.LastIndexOf("\\", StringComparison.Ordinal) + 1);

            return filename;
        }
    }
}
