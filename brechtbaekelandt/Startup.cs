using brechtbaekelandt.Data.Contexts;
using brechtbaekelandt.Data.Contexts.Identity;
using brechtbaekelandt.Extensions;
using brechtbaekelandt.Helpers;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Identity.Models;
using brechtbaekelandt.Services;
using brechtbaekelandt.Settings;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using System;
using System.Buffers;
using System.Diagnostics;
using System.Xml;
using System.Xml.Serialization;

namespace brechtbaekelandt
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            this.Configuration = builder.Build();

        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services
                .Configure<IdentityOptions>(
                    options =>
                    {
                        // Password settings
                        options.Password.RequireDigit = true;
                        options.Password.RequiredLength = 6;
                        options.Password.RequireNonAlphanumeric = true;
                        options.Password.RequireUppercase = false;
                        options.Password.RequireLowercase = true;
                        //options.Password.RequiredUniqueChars = 6;

                        // Lockout settings
                        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                        options.Lockout.MaxFailedAccessAttempts = 10;
                        options.Lockout.AllowedForNewUsers = true;

                        // User settings
                        options.User.RequireUniqueEmail = true;
                        options.User.AllowedUserNameCharacters =
                            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                    });

            services
                .Configure<FormOptions>(
                    options =>
                    {
                        options.ValueLengthLimit = int.MaxValue;
                        options.MultipartBodyLengthLimit = int.MaxValue;
                        options.MultipartHeadersLengthLimit = int.MaxValue;
                    });

            services
                .Configure<MailjetSettings>(
                    Configuration.GetSection("Mailjet"));

            services
               .ConfigureAutoMapper();

            services
                .TryAddScoped<BlogDbContext, BlogDbContext>();

            services
                .TryAddScoped<CaptchaHelper, CaptchaHelper>();

            services
               .TryAddScoped<IEmailService, EmailService>();

            services
                .TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services
                .TryAddSingleton(Configuration);

            services
                .AddMemoryCache();

            services
                .AddDistributedMemoryCache();

            services
                .AddSession(options =>
                {
                    options.Cookie.HttpOnly = false;
                });

            services
                .AddDbContext<ApplicationIdentityDbContext>(
                    options =>
                    {
                        options.UseSqlServer(Configuration.GetConnectionString("Identity"));
                    })
                .AddDbContext<BlogDbContext>(
                    options =>
                    {
                        options.UseSqlServer(Configuration.GetConnectionString("Blog"));
                    }); ;


            services
                .AddApplicationIdentity()
                .AddEntityFrameworkStores<ApplicationIdentityDbContext>()
                .AddClaimsPrincipalFactory<UserClaimsPrincipalFactory<ApplicationUser, ApplicationUserRole>>()
                .AddRoleStore<ApplicationRoleStore>()
                .AddUserStore<ApplicationUserStore>()
                .AddSignInManager<ApplicationSignInManager>()
                .AddUserManager<ApplicationUserManager>()
                .AddDefaultTokenProviders();

            services
                .AddAuthentication(
                    options =>
                    {
                        options.DefaultScheme = IdentityConstants.ApplicationScheme;
                        options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
                        options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
                    })
                .AddCookie(IdentityConstants.ApplicationScheme,
                    options =>
                    {
                        // Cookie settings
                        options.Cookie.HttpOnly = true;
                        options.Cookie.Expiration = TimeSpan.FromDays(150);
                        options.LoginPath = "/account/sign-in";
                        options.LogoutPath = "/account/sign-out";
                        options.AccessDeniedPath = "/account/access-denied";
                        options.SlidingExpiration = true;
                    })
                .AddCookie(IdentityConstants.ExternalScheme,
                    options =>
                    {
                        options.Cookie.Name = IdentityConstants.ExternalScheme;
                        options.ExpireTimeSpan = TimeSpan.FromMinutes(5.0);
                    })
                .AddCookie(IdentityConstants.TwoFactorRememberMeScheme,
                    options =>
                    {
                        options.Cookie.Name = IdentityConstants.TwoFactorRememberMeScheme;
                    })
                .AddCookie(IdentityConstants.TwoFactorUserIdScheme, options =>
                {
                    options.Cookie.Name = IdentityConstants.TwoFactorUserIdScheme;
                    options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
                });

            services
                .AddMvc(
                    options =>
                    {
                        if (!Debugger.IsAttached)
                        {
                            options.RequireHttpsPermanent = true;
                        }

                        var jsonSerializerSettings = new JsonSerializerSettings
                        {
                            ContractResolver = new CamelCasePropertyNamesContractResolver(),
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        };
                       
                        options.OutputFormatters.Add(new JsonOutputFormatter(jsonSerializerSettings, ArrayPool<char>.Shared));
                        options.OutputFormatters.Add(new XmlSerializerOutputFormatter());
                    })
                .AddJsonOptions(
                    options =>
                    {
                        options.SerializerSettings.Converters.Add(new StringEnumConverter());
                    });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles();

            app.UseAuthentication();

            app.UseSession();

            if (!Debugger.IsAttached)
            {
                var options = new RewriteOptions()
                    .AddRedirectToHttps();

                app.UseRewriter(options);
            }

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}