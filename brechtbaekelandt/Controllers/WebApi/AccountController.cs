﻿using AutoMapper;
using brechtbaekelandt.Data.Contexts;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Filters;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Identity.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace brechtbaekelandt.Controllers.WebApi
{
    [Route("api/account")]
    public class AccountController : BaseController
    {
        private readonly ApplicationUserManager _applicationUserManager;

        private readonly BlogDbContext _blogDbContext;

        public AccountController(
            ApplicationUserManager applicationUserManager, BlogDbContext blogDbContext)
        {
            this._applicationUserManager = applicationUserManager;

            this._blogDbContext = blogDbContext;
        }

        [Authorize]
        [HttpGet]
        [Route("all")]
        public IActionResult GetUsersActionResult()
        {
            return this.Json(Mapper.Map<ICollection<Models.User>>(this._blogDbContext.Users.ToCollection()));
        }

        [Authorize]
        [HttpPost]
        [Route("add")]
        [Validate]
        public async Task<IActionResult> AddUserAsyncActionResult([FromBody] ApplicationUserWithPassword user)
        {
            var newId = Guid.NewGuid();
            user.Id = newId;

            var result = await this._applicationUserManager.CreateUserAsync(newId, user.UserName, user.Password, user.EmailAddress, user.FirstName, user.LastName, user.IsAdmin);

            if (!result.Succeeded)
            {
                return this.StatusCode((int)HttpStatusCode.BadRequest, result.Errors.Select(e => e.Description.ToLowerInvariant()));
            }

            await this._blogDbContext.Users.AddAsync(Mapper.Map<Data.Entities.User>(user));

            await this._blogDbContext.SaveChangesAsync();

            return this.Ok(new { message = "the user was successfully added.", user });
        }

        [Authorize]
        [HttpPost]
        [Route("update")]
        [Validate]
        public async Task<IActionResult> UpdateUserAsyncActionResult([FromBody] ApplicationUser user)
        {
            var userToUpdate = await this._applicationUserManager.FindByIdAsync(user.Id);

            if (userToUpdate == null)
            {
                return this.NotFound();
            }

            userToUpdate.FirstName = user.FirstName;
            userToUpdate.LastName = user.LastName;
            userToUpdate.EmailAddress = user.EmailAddress;
            userToUpdate.Email = user.Email;
            userToUpdate.IsAdmin = user.IsAdmin;

            var result = await this._applicationUserManager.UpdateAsync(userToUpdate);

            if (!result.Succeeded)
            {
                return this.StatusCode((int)HttpStatusCode.BadRequest, result.Errors.Select(e => e.Description.ToLowerInvariant()));
            }

            if (!this._blogDbContext.Users.Any(u => u.Id == user.Id))
            {
                return this.NotFound();
            }

            this._blogDbContext.Users.Update(Mapper.Map<Data.Entities.User>(user));

            await this._blogDbContext.SaveChangesAsync();

            return this.Ok(new { message = "the user was successfully updated.", user });
        }

        [Authorize]
        [HttpPost]
        [Route("delete")]
        public async Task<IActionResult> DeleteUserAsyncActionResult(Guid userId)
        {
            var user = await this._applicationUserManager.FindByIdAsync(userId.ToString());

            if (user == null)
            {
                return this.NotFound();
            }

            var result = await this._applicationUserManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                return this.StatusCode((int)HttpStatusCode.BadRequest, result.Errors.Select(e => e.Description.ToLowerInvariant()));
            }

            if (!this._blogDbContext.Users.Any(p => p.Id == userId))
            {
                return this.NotFound();
            }

            var userEntity = this._blogDbContext.Users
                .Include(u => u.Posts)
                .FirstOrDefault(u => u.Id == userId);

            userEntity.Posts?.Clear();

            await this._blogDbContext.SaveChangesAsync();

            this._blogDbContext.Users.Remove(userEntity);

            await this._blogDbContext.SaveChangesAsync();

            return this.Ok(new { message = "the user was successfully deleted." });
        }
    }
}