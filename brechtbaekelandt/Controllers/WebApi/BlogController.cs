using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Runtime.Serialization.Formatters.Binary;
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
using brechtbaekelandt.Services;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Authorization;
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

        private readonly ApplicationUserManager _applicationUserManager;

        private readonly IEmailService _emailService;

        private readonly IHostingEnvironment _hostingEnvironment;

        private const int _postsPerPage = 5;

        private readonly CaptchaHelper _captchaHelper;

        public BlogController(BlogDbContext blogDbcontext, ApplicationUserManager userManager, CaptchaHelper captchaHelper, IEmailService emailService, IHostingEnvironment hostingEnvironment)
        {
            this._applicationUserManager = userManager;
            this._blogDbContext = blogDbcontext;
            this._captchaHelper = captchaHelper;

            this._hostingEnvironment = hostingEnvironment;
            this._emailService = emailService;
            this._emailService.TemplateRootPath = this._hostingEnvironment.ContentRootPath;
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

        [Authorize]
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



            return this.Json(new { link = $"{relativePath}/{newFileName}" });
        }

        [Authorize]
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

            return this.Ok(new { message = "the picture was succesfully deleted." });
        }

        [Authorize]
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

            return this.Json(new { attachments = results });
        }

        [Authorize]
        [HttpPost]
        [Route("delete-attachment")]
        public IActionResult DeleteAttachmentActionResult([FromBody]Models.Attachment attachment)
        {
            var attachmentPath = $"{this._hostingEnvironment.WebRootPath}{attachment.Url.Replace("/", "\\")}";

            System.IO.File.Delete(attachmentPath);

            return this.Json(attachment);
        }

        [Authorize]
        [HttpPost]
        [Route("post/add")]
        [Validate]
        public async Task<IActionResult> CreatePostAsyncActionResult([FromBody]Models.Post post)
        {
            post.Id = Guid.NewGuid();
            post.Created = DateTime.Now;

            var postEntity = Mapper.Map<Post>(post);

            var currentUserName = this.HttpContext.User?.Identity.Name;

            var userEntity = this._blogDbContext.Users.FirstOrDefault(u => u.UserName == currentUserName);

            if (userEntity == null)
            {
                var user = await this._applicationUserManager.FindByNameAsync(currentUserName);

                userEntity = Mapper.Map<User>(user);
            }

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

            return this.Json(Mapper.Map<Models.Post>(postEntity));
        }

        [Authorize]
        [HttpPost]
        [Route("post/update")]
        [Validate]
        public async Task<IActionResult> UpdatePostAsyncActionResult([FromBody]Models.Post post)
        {
            if (!this._blogDbContext.Posts.Any(p => p.Id == post.Id))
            {
                return this.NotFound();
            }

            post.LastModified = DateTime.Now;

            var postEntity = Mapper.Map<Post>(post);

            this._blogDbContext.Update(postEntity);

            foreach (var category in post.Categories.Where(c => c.Id == Guid.Empty))
            {
                await this._blogDbContext.Categories.AddAsync(Mapper.Map<Category>(category));
            }

            await this._blogDbContext.SaveChangesAsync();

            postEntity = this._blogDbContext.Posts.Include(p => p.PostCategories).FirstOrDefault(p => p.Id == post.Id);

            foreach (var category in post.Categories)
            {
                var categoryEntity = this._blogDbContext.Categories.First(c => c.Name == category.Name);

                if (!postEntity.PostCategories.Any(pc => pc.CategoryId == categoryEntity.Id))
                {
                    postEntity.PostCategories.Add(new PostCategory() { CategoryId = categoryEntity.Id });
                }
            }

            foreach (var postCategory in postEntity.PostCategories.Where(pc => !post.Categories.Any(c => c.Id == pc.CategoryId)).ToCollection())
            {
                postEntity.PostCategories.Remove(postCategory);
            }

            this._blogDbContext.Update(postEntity);

            await this._blogDbContext.SaveChangesAsync();

            return this.Json(Mapper.Map<Models.Post>(postEntity));
        }

        [Authorize]
        [HttpPost]
        [Route("post/delete")]
        public async Task<IActionResult> DeletePostAsyncActionResult(Guid postId)
        {
            if (!this._blogDbContext.Posts.Any(p => p.Id == postId))
            {
                return this.NotFound();
            }

            var postEntity = this._blogDbContext.Posts
                .Include(p => p.PostCategories)
                .Include(p => p.Attachments)
                .Include(p => p.Comments)
                .FirstOrDefault(p => p.Id == postId);

            postEntity.PostCategories?.Clear();
            postEntity.Attachments?.Clear();
            postEntity.Comments?.Clear();

            await this._blogDbContext.SaveChangesAsync();

            this._blogDbContext.Posts.Remove(postEntity);

            await this._blogDbContext.SaveChangesAsync();

            return this.Json(new { message = "the post was successfully deleted." });
        }

        [HttpPost]
        [Route("post/add-comment")]
        [Validate]
        [ValidateCaptcha("commentCaptcha")]
        public async Task<IActionResult> CreateCommentAsyncActionResult(Guid postId, [FromBody]Models.Comment comment)
        {
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

            return this.Json(comment);
        }

        [Authorize]
        [HttpPost]
        [Route("post/delete-comment")]
        [Validate]
        public async Task<IActionResult> DeleteCommentAsyncActionResult(Guid commentId)
        {
            if (!this._blogDbContext.Comments.Any(c => c.Id == commentId))
            {
                return this.NotFound();
            }

            var commentEntity = this._blogDbContext.Comments
                .FirstOrDefault(c => c.Id == commentId);

            this._blogDbContext.Comments.Remove(commentEntity);

            await this._blogDbContext.SaveChangesAsync();

            return this.Json(new { message = "the comment was successfully deleted." });
        }

        [HttpPost]
        [Route("post/like")]
        public async Task<IActionResult> LikePostAsyncActionResult(Guid postId)
        {
            if (!this._blogDbContext.Posts.Any(p => p.Id == postId))
            {
                return this.NotFound();
            }

            var postEntity = this._blogDbContext.Posts
                .FirstOrDefault(p => p.Id == postId);

            var currentLikesNumber = postEntity.Likes += 1;

            postEntity.Likes = currentLikesNumber;

            this._blogDbContext.Update(postEntity);

            await this._blogDbContext.SaveChangesAsync();

            return this.Json(currentLikesNumber);
        }


        [HttpPost]
        [Route("post/unlike")]
        public async Task<IActionResult> UnlikePostAsyncActionResult(Guid postId)
        {
            if (!this._blogDbContext.Posts.Any(p => p.Id == postId))
            {
                return this.NotFound();
            }

            var postEntity = this._blogDbContext.Posts
                .FirstOrDefault(p => p.Id == postId);

            var currentLikesNumber = postEntity.Likes != 0 ? postEntity.Likes -= 1 : 0;

            postEntity.Likes = currentLikesNumber;

            this._blogDbContext.Update(postEntity);

            await this._blogDbContext.SaveChangesAsync();

            return this.Json(currentLikesNumber);
        }

        [HttpPost]
        [Route("subscribe")]
        [Validate]
        public async Task<IActionResult> SubscribeAsyncActionResult([FromBody]Models.Subscriber subscriber)
        {
            await this._emailService.SendSubscribedEmailAsync(subscriber.EmailAddress, this.CreateSubscribeConfirmationLink(subscriber), subscriber.Categories);

            return this.Json(new { message = "you have successfully subscribed!" });
        }
        
        private string CreateSubscribeConfirmationLink(Models.Subscriber subscriber)
        {
            var subscriberString = this.SerializeSubscriber(subscriber);

            return $"http://www.brechtbaekelandt.net/subscriber/confirm?subscriber={subscriberString}";
        }

        private string SerializeSubscriber(Models.Subscriber subscriber)
        {
            using (var ms = new MemoryStream())
            {
                new BinaryFormatter().Serialize(ms, subscriber);
                return Convert.ToBase64String(ms.ToArray());
            }
        }

        private Models.Subscriber DeserializeSubscriber(string base64String)
        {
            var bytes = Convert.FromBase64String(base64String);

            using (var ms = new MemoryStream(bytes, 0, bytes.Length))
            {
                ms.Write(bytes, 0, bytes.Length);
                ms.Position = 0;

                return new BinaryFormatter().Deserialize(ms) as Models.Subscriber;
            }
        }

        private string EnsureCorrectFilename(string filename)
        {
            if (filename.Contains("\\"))
                filename = filename.Substring(filename.LastIndexOf("\\", StringComparison.Ordinal) + 1);

            return filename;
        }
    }
}
