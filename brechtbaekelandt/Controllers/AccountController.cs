using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using brechtbaekelandt.Identity;
using brechtbaekelandt.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace brechtbaekelandt.Controllers
{
    public class AccountController : BaseController
    {
        private readonly ApplicationUserManager _applicationUserManager;
        private readonly ApplicationSignInManager _applicationSignInManager;
        
        public AccountController(
            ApplicationUserManager applicationUserManager,
            ApplicationSignInManager applicationSignInManager) : base(applicationUserManager)
        {
            this._applicationUserManager = applicationUserManager;
            this._applicationSignInManager = applicationSignInManager;
        }

        [Authorize]
        [HttpGet]
        public IActionResult Index()
        {
            return this.View();
        }

        [HttpGet]
        public IActionResult SignIn(string returnUrl = null)
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SignIn(SignInViewModel signIn, string returnUrl = null)
        {
            if (this.ModelState.IsValid)
            {
                SignInResult signInResult;

                try
                {
                    var userNameIsEmailAddress = Regex.IsMatch(signIn.Username,
                        @"^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$");

                    if (userNameIsEmailAddress)
                    {
                        signInResult = await this._applicationSignInManager.PasswordEmailSignInAsync(signIn.Username,
                            signIn.Password, signIn.RememberMe, false);
                    }
                    else
                    {
                        signInResult = await this._applicationSignInManager.PasswordSignInAsync(signIn.Username, signIn.Password,
                            signIn.RememberMe, false);
                    }
                }
                catch (Exception)
                {
                    this.ViewData["Error"] = "there was a problem logging you in.";

                    return this.View(signIn);
                }


                if (signInResult.Succeeded)
                {
                    return this.RedirectToLocal(returnUrl ?? "/admin");
                }
                else
                {
                    this.ViewData["Error"] = "the username and/or password was incorrect.";

                    return this.View(signIn);
                }
            }
            else
            {
                this.ViewData["Error"] = "the username and/or password must be filled in.";

                return this.View(signIn);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SignOut()
        {
            await this._applicationSignInManager.SignOutAsync();

            return this.RedirectToAction(nameof(HomeController.Index), "Home");
        }

        #region Helpers

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }

        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }
        }

        #endregion
    }
}