using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using brechtbaekelandt.Filters;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Identity.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace brechtbaekelandt.Controllers.WebApi
{
    [Produces("application/json")]
    [Route("api/account")]
    public class AccountController : Controller
    {
        private readonly ApplicationUserManager _applicationUserManager;        

        public AccountController(
            ApplicationUserManager applicationUserManager)
        {
            this._applicationUserManager = applicationUserManager;          
        }

        //[Authorize]
        [HttpPost]
        [Route("add")]
        [ValidationActionFilter]
        public async Task<IActionResult> AddBlogUserAsyncActionResult([FromBody] ApplicationUserWithPassword user)
        {
            var result = await this._applicationUserManager.CreateUserAsync(Guid.NewGuid(), user.UserName, user.Password, user.EmailAddress, user.FirstName, user.LastName, user.IsAdmin);

            return !result.Succeeded ? this.StatusCode((int)HttpStatusCode.BadRequest, result.Errors.Select(e => e.Description.ToLowerInvariant())) : this.Ok(new { message = "the user was addded." });
        }
    }
}