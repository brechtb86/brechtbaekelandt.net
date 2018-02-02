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
using brechtbaekelandt.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace brechtbaekelandt.Controllers.WebApi
{


    [Authorize]
    [Route("api/blog")]
    [Produces("application/json")]
    public class BlogController : Controller
    {
        private readonly BlogDbContext _blogDbContext;

        private readonly ApplicationUserManager _userManager;

        public BlogController(BlogDbContext blogDbcontext, ApplicationUserManager userManager)
        {
            this._userManager = userManager;
            this._blogDbContext = blogDbcontext;

        }

        [HttpGet]
        [Route("posts/filter")]
        public IActionResult FilterPostsAsyncActionResult(string searchFilterString = "", string categoryName = "", string keywordsString = "")
        {
            var searchTerms = !string.IsNullOrEmpty(searchFilterString) ? searchFilterString.Split(',') : new string[0];
            var keywords = !string.IsNullOrEmpty(keywordsString) ? keywordsString.Split(',') : new string[0];

            var query = this._blogDbContext.Posts.Where(
                p => p.PostCategories.Any(pc =>
                    (string.IsNullOrEmpty(categoryName) || pc.Category.Name == categoryName)
                    || (searchTerms.Length <= 0 ||
                        searchTerms.Any(s1 => p.Description.Split(" ", StringSplitOptions.None).Contains(s1)))
                    || (searchTerms.Length <= 0 || searchTerms.Any(s2 =>
                            !string.IsNullOrEmpty(p.Content) &&
                            p.Content.Split(" ", StringSplitOptions.None).Contains(s2)))
                    || (keywords.Length <= 0 ||
                        keywords.Any(k1 => p.Description.Split(" ", StringSplitOptions.None).Contains(k1)))
                    || (keywords.Length <= 0 || keywords.Any(k2 =>
                            !string.IsNullOrEmpty(p.Content) &&
                            p.Content.Split(" ", StringSplitOptions.None).Contains(k2)))
                ));


            return this.Ok(Mapper.Map<ICollection<Models.Post>>(query));
        }

        [HttpGet]
        [Route("posts")]
        public async Task<IActionResult> GetPostsAsyncActionResult(int index, int count, string categoryId)
        {
            //ICollection<Data.Entities.Post> postEntities;

            //int totalPostCount;

            //if (categoryId == null)
            //{
            //    var query = this._blogDbContext.Posts.
            //        OrderByDescending(p => p.Created);

            //    totalPostCount = query.Count();

            //    postEntities = query
            //        .Skip(index)
            //        .Take(count)
            //        .ToList()
            //        .Select(p => new Data.Entities.Post
            //        {
            //            Categories = p.Categories,
            //            CommentCount = p.Comments.Count,
            //            Content = p.Content,
            //            Created = p.Created,
            //            Description = p.Description,
            //            Id = p.Id,
            //            InternalTitle = p.InternalTitle,
            //            Title = p.Title,
            //            LastModified = p.LastModified,
            //            User = p.User

            //        }).ToList();
            //}
            //else
            //{
            //    var categoryGuid = Guid.Parse(categoryId);

            //    var query = this._blogDbContext.Posts
            //        .Where(p => p.Categories.Any(c => c.Id == categoryGuid))
            //        .OrderByDescending(p => p.Created);

            //    totalPostCount = query.Count();

            //    postEntities = query
            //        .Skip(index)
            //        .Take(count)
            //        .ToList()
            //        .Select(p => new Data.Entities.Post
            //        {
            //            Categories = p.Categories,
            //            CommentCount = p.Comments.Count,
            //            Content = p.Content,
            //            Created = p.Created,
            //            Description = p.Description,
            //            Id = p.Id,
            //            InternalTitle = p.InternalTitle,
            //            Title = p.Title,
            //            LastModified = p.LastModified,
            //            User = p.User

            //        }).ToList();
            //}

            //var posts = Mapper.Map<List<Post>>(postEntities);

            //var result = new { TotalPostCount = totalPostCount, Posts = posts };

            //return this.Ok(result);

            return null;
        }

        [HttpGet]

        public async Task<IActionResult> SearchPostsAsyncActionResult(int index, int count, string categoryId, string searchTerm)
        {
            //List<Data.Entities.Post> postEntities;

            //int totalPostCount;

            //if (string.IsNullOrEmpty(searchTerm))
            //{
            //    return await this.GetPostsAsyncActionResult(index, count, categoryId);
            //}

            //var searchTerms = searchTerm.ToLower().Split(' ');

            //if (categoryId == null)
            //{
            //    var query = this._blogDbContext.Posts
            //        .Where(p => searchTerms.Any(s => p.Title.ToLower().Contains(s))
            //                    || searchTerms.Any(s => p.Description.ToLower().Contains(s))
            //                    || searchTerms.Any(s => p.Content.ToLower().Contains(s))
            //                    || searchTerms.Any(s => p.User.Name.ToLower().Contains(s)))
            //        .OrderByDescending(p => p.Created);

            //    totalPostCount = query.Count();

            //    postEntities = query
            //       .Skip(index)
            //       .Take(count)
            //       .ToList()
            //       .Select(p => new Data.Entities.Post
            //       {
            //           Categories = p.Categories,
            //           CommentCount = p.Comments.Count,
            //           Content = p.Content,
            //           Created = p.Created,
            //           Description = p.Description,
            //           Id = p.Id,
            //           InternalTitle = p.InternalTitle,
            //           Title = p.Title,
            //           LastModified = p.LastModified,
            //           User = p.User

            //       }).ToList();
            //}
            //else
            //{
            //    var categoryGuid = Guid.Parse(categoryId);

            //    var query = this._blogDbContext.Posts
            //        .Where(p => p.Categories.Any(c => c.Id == categoryGuid))
            //        .Where(p => searchTerms.Any(s => p.Title.ToLower().Contains(s))
            //                    || searchTerms.Any(s => p.Description.ToLower().Contains(s))
            //                    || searchTerms.Any(s => p.Content.ToLower().Contains(s))
            //                    || searchTerms.Any(s => p.User.Name.ToLower().Contains(s)))
            //        .OrderByDescending(p => p.Created);

            //    totalPostCount = query.Count();

            //    postEntities = query
            //       .Skip(index)
            //       .Take(count)
            //       .ToList()
            //       .Select(p => new Data.Entities.Post
            //       {
            //           Categories = p.Categories,
            //           CommentCount = p.Comments.Count,
            //           Content = p.Content,
            //           Created = p.Created,
            //           Description = p.Description,
            //           Id = p.Id,
            //           InternalTitle = p.InternalTitle,
            //           Title = p.Title,
            //           LastModified = p.LastModified,
            //           User = p.User

            //       }).ToList();
            //}

            //var posts = Mapper.Map<List<Post>>(postEntities);

            //return this.Ok(new { TotalPostCount = totalPostCount, Posts = posts });

            return null;
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

            //if (!ModelState.IsValid)
            //{

            //}

            //if (post.Categories.Count == 0)
            //{
            //    //throw new HttpResponseException(new HttpResponseMessage
            //    //{
            //    //    StatusCode = HttpStatusCode.BadRequest,
            //    //    ReasonPhrase = "You must at least select one category."
            //    //});
            //}

            //if (this._blogDbContext.Posts.Any(p => p.Title.ToLower() == post.Title))
            //{
            //    //throw new HttpResponseException(new HttpResponseMessage
            //    //{
            //    //    StatusCode = HttpStatusCode.BadRequest,
            //    //    ReasonPhrase = "This title already exists, please choose another one."
            //    //});
            //}

            //var now = DateTime.Now;
            //post.Created = now;
            //post.LastModified = now;

            //var postEntity = Mapper.Map<Data.Entities.Post>(post);
            //postEntity.InternalTitle = postEntity.Title.RemoveSpecialCharacters().Trim().Replace(' ', '-').ToLower();

            //postEntity.Categories.ForEach(c =>
            //{
            //    if (this._blogDbContext.Categories.Any(cat => cat.Id == c.Id))
            //    {
            //        this._blogDbContext.Categories.Attach(c);
            //    }
            //});

            ////var currentUserId = Guid.Parse(HttpContext.Current.User.Identity.GetUserId());
            ////postEntity.User = this._blogDbContext.Users.FirstOrDefault(u => u.Id == currentUserId);

            //this._blogDbContext.Posts.Add(postEntity);
            //this._blogDbContext.SaveChanges();

            //return this.Ok(postEntity.Id);


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
