using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using brechtbaekelandt.Data;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Models;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace brechtbaekelandt.Controllers
{
    [Route("blog")]
    public class BlogController : BaseController
    {
        private readonly BlogDbContext _blogDbContext;

        private readonly ApplicationUserManager _applicationUserManager;

        public BlogController(BlogDbContext blogDbContext, ApplicationUserManager applicationUserManager) : base(applicationUserManager)
        {
            this._blogDbContext = blogDbContext;
            this._applicationUserManager = applicationUserManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        //public IActionResult Post()
        //{
        //    return View();
        //}


        [HttpGet("post/{internalTitle}")]
        public async Task<IActionResult> Post(string internalTitle)
        {
            var postEntity = await this._blogDbContext.Posts
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Include(p => p.PostCategories)
                .ThenInclude(pc => pc.Category)
                .FirstOrDefaultAsync(p => p.InternalTitle == internalTitle);

            if (postEntity == null)
            {
                return this.NotFound("this post was not found.");
            }

            var vm = new PostViewModel
            {
                Post = Mapper.Map<Post>(postEntity)
            };

            return View(vm);



        }
    }
}