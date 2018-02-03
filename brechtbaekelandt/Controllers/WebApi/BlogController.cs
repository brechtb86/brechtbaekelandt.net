using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using brechtbaekelandt.Attributes;
using brechtbaekelandt.Data;
using brechtbaekelandt.Data.Entities;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Identity;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace brechtbaekelandt.Controllers.WebApi
{
    [Route("api/blog")]
    [Produces("application/json")]
    public class BlogController : Controller
    {
        private readonly BlogDbContext _blogDbContext;

        private readonly ApplicationUserManager _userManager;

        private const int _postsPerPage = 5;

        public BlogController(BlogDbContext blogDbcontext, ApplicationUserManager userManager)
        {
            this._userManager = userManager;
            this._blogDbContext = blogDbcontext;

        }

        [HttpGet]
        [Route("posts")]
        public IActionResult GetPostsAsyncActionResult(string searchTermsString = "", Guid? categoryId = null, string tagsString = "", int currentPage = 1)
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
                    (searchTerms.Length == 0 || searchTerms.Any(s => p.Title.ToLower().Contains(s.ToLower()))) &&
                    (searchTerms.Length == 0 || searchTerms.Any(s => p.Description.ToLower().Contains(s.ToLower()))) &&
                    (searchTerms.Length == 0 || searchTerms.Any(s => !string.IsNullOrEmpty(p.Content) && p.Content.ToLower().Contains(s.ToLower()))) &&
                    (tags.Length == 0 || tags.Any(t => !string.IsNullOrEmpty(p.Tags) && p.Tags.ToLower().Contains(t.ToLower())))
                )
                .OrderByDescending(p => p.Created)
                .Skip((currentPage - 1) * _postsPerPage)
                .Take(_postsPerPage);

            var totalPostCount = this._blogDbContext.Posts.Count();

            var viewModel = new ApiPostsViewModel
            {
                CurrentPage = currentPage,
                TotalPostCount = totalPostCount,
                PostsPerPage = _postsPerPage,
                Posts = Mapper.Map<ICollection<Models.Post>>(query)
            };

            return this.Ok(viewModel);
        }

        [HttpPost]
        [Route("post/add")]
        [ValidationActionFilter]
        public async Task<IActionResult> CreatePostAsyncActionResult([FromBody]Models.Post post)
        {
            //var files = HttpContext.Request.Form.Files;

            //foreach (var image in files)
            //{
            //    if (image != null && image.Length > 0)
            //    {
            //        var file = image;
            //        //var uploads = Path.Combine(this._hostingEnvironment.WebRootPath, "images\\blog");

            //        //if (file.Length > 0)
            //        //{
            //        //    var fileGuid = Guid.NewGuid();

            //        //    var fileName = $"{fileGuid}{file.FileName.Substring(file.FileName.LastIndexOf(".", StringComparison.Ordinal))}";

            //        //    using (var fileStream = new FileStream(Path.Combine(uploads, fileName), FileMode.Create))
            //        //    {
            //        //        await file.CopyToAsync(fileStream);
            //        //        post.PictureUrl = $@"\images\blog\{fileName}";
            //        //    }
            //        //}
            //    }
            //}

            post.Id = Guid.NewGuid();
            post.Created = DateTime.Now;
            post.LastModified = DateTime.Now;

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

            return this.Ok();
        }

        [HttpPost]
        [Route("posts/edit")]
        public async Task<IActionResult> EditAsyncActionResult([FromBody]Post post)
        {
            //this.ModelState["post.User.Password"].Errors.Clear();

            ////if (!ModelState.IsValid)
            ////{
            ////    throw new HttpResponseException(new HttpResponseMessage
            ////    {
            ////        StatusCode = HttpStatusCode.BadRequest,
            ////        ReasonPhrase = "Please fill in the required fields."
            ////    });
            ////}

            //if (post.Categories.Count == 0)
            //{
            //    //throw new HttpResponseException(new HttpResponseMessage
            //    //{
            //    //    StatusCode = HttpStatusCode.BadRequest,
            //    //    ReasonPhrase = "You must at least select one category."
            //    //});
            //}

            //if (this._blogDbContext.Posts.Any(p => p.Title.ToLower() == post.Title && p.Id != post.Id))
            //{
            //    //throw new HttpResponseException(new HttpResponseMessage
            //    //{
            //    //    StatusCode = HttpStatusCode.BadRequest,
            //    //    ReasonPhrase = "This title already exists, please choose another one."
            //    //});
            //}

            //post.LastModified = DateTime.Now;
            ////post.InternalTitle = post.Title.RemoveSpecialCharacters().Trim().Replace(' ', '-').ToLower();

            //var postEntity = await this._blogDbContext.Posts.FirstAsync(p => p.Id == post.Id);

            //postEntity.Categories =
            //    postEntity.Categories.Where(c => post.Categories.Any(cat => cat.Id == c.Id)).ToCollection();

            //var categoriesToAdd = post.Categories.Where(c => postEntity.Categories.All(cat => cat.Id != c.Id)).Select(
            //    c =>
            //    {
            //        var existingCategoryEntity = this._blogDbContext.Categories.FirstOrDefault(cat => cat.Id == c.Id);

            //        if (existingCategoryEntity == null)
            //        {
            //            return Mapper.Map<Data.Entities.Category>(c);
            //        }
            //        else
            //        {
            //            return existingCategoryEntity;
            //        }
            //    });

            //postEntity.Categories.AddRange(categoriesToAdd);

            //Mapper.Map(post, postEntity);

            //this._blogDbContext.Entry(postEntity).State = EntityState.Modified;

            ////var currentUserId = Guid.Parse(HttpContext.Current.User.Identity.GetUserId());
            ////postEntity.User = this._blogDbContext.Users.FirstOrDefault(u => u.Id == currentUserId);

            //this._blogDbContext.SaveChanges();

            //return this.Ok(postEntity.Id);

            return null;
        }
    }
}
