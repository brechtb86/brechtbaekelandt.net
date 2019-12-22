﻿using System;
using System.Diagnostics;
using System.Linq;
using AutoMapper;
using brechtbaekelandt.Identity;
using brechtbaekelandt.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;


namespace brechtbaekelandt.Extensions
{
    /// <summary>
    /// Provides extension methods for configuring the DI container
    /// </summary>`
    public static class ServiceCollectionExtensions
    {
        private class EmptyGuidValueResolver : IValueResolver<Base, Data.Entities.BaseEntity, Guid>
        {
            public Guid Resolve(Base source, Data.Entities.BaseEntity destination, Guid destMember, ResolutionContext context)
            {
                return source.Id == Guid.Empty ? Guid.NewGuid() : source.Id;
            }
        }
        
        public static void ConfigureAutoMapper(this IServiceCollection collection)
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Identity.Models.ApplicationUser, Models.ApplicationUser>();
                cfg.CreateMap<Models.ApplicationUser, Identity.Models.ApplicationUser>();

                cfg.CreateMap<Identity.Models.ApplicationUser, User>();

                cfg.CreateMap<Data.Entities.Post, Post>()
                    .ForMember(dest => dest.Categories,opt => opt.MapFrom(src => src.PostCategories.Select(pc => new Category() { Id = pc.CategoryId, Name = pc.Category.Name })))
                    .ForMember(dest => dest.Tags,opt => opt.MapFrom(src => !string.IsNullOrEmpty(src.Tags) ? src.Tags.Split(",", StringSplitOptions.None).ToArray() : new string[0]));

                cfg.CreateMap<Data.Entities.Post, ArchivedPost>();

                cfg.CreateMap<Data.Entities.Subscriber, Subscriber>()
                   .ForMember(dest => dest.Categories, opt => opt.MapFrom(src => src.SubscriberCategories.Select(sc => new Category() { Id = sc.CategoryId, Name = sc.Category.Name })));

                cfg.CreateMap<Data.Entities.Comment, Comment>();
                cfg.CreateMap<Data.Entities.Category, Category>();
                cfg.CreateMap<Data.Entities.User, User>();
                cfg.CreateMap<Data.Entities.User, ApplicationUser>();
                cfg.CreateMap<Data.Entities.User, Identity.Models.ApplicationUser>();
                cfg.CreateMap<Data.Entities.Attachment, Attachment>();

                cfg.CreateMap<Post, Data.Entities.Post>()
                    .ForMember(dest => dest.Id, opt => opt.ResolveUsing<EmptyGuidValueResolver>())
                    .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => string.Join(',', src.Tags)));
                cfg.CreateMap<Subscriber, Data.Entities.Subscriber>()
                    .ForMember(dest => dest.Id, opt => opt.ResolveUsing<EmptyGuidValueResolver>());
                cfg.CreateMap<Comment, Data.Entities.Comment>()
                    .ForMember(dest => dest.Id, opt => opt.ResolveUsing<EmptyGuidValueResolver>());
                cfg.CreateMap<Category, Data.Entities.Category>()
                    .ForMember(dest => dest.Id, opt => opt.ResolveUsing<EmptyGuidValueResolver>());
                cfg.CreateMap<User, Data.Entities.User>()
                    .ForMember(dest => dest.Id, opt => opt.ResolveUsing<EmptyGuidValueResolver>());
                cfg.CreateMap<ApplicationUser, Data.Entities.User>();
                cfg.CreateMap<Identity.Models.ApplicationUser, Data.Entities.User>();
                cfg.CreateMap<Attachment, Data.Entities.Attachment>()
                    .ForMember(dest => dest.Id, opt => opt.ResolveUsing<EmptyGuidValueResolver>());

               
            });
        }

        public static IdentityBuilder AddApplicationIdentity(
            this IServiceCollection services, Action<IdentityOptions> setupAction = null)
        {
            services.TryAddScoped<IUserValidator<Identity.Models.ApplicationUser>, UserValidator<Identity.Models.ApplicationUser>>();
            services.TryAddScoped<IPasswordValidator<Identity.Models.ApplicationUser>, PasswordValidator<Identity.Models.ApplicationUser>>();
            services.TryAddScoped<IPasswordHasher<Identity.Models.ApplicationUser>, PasswordHasher<Identity.Models.ApplicationUser>>();
            services.TryAddScoped<ILookupNormalizer, UpperInvariantLookupNormalizer>();
            services.TryAddScoped<IRoleValidator<Identity.Models.ApplicationUserRole>, RoleValidator<Identity.Models.ApplicationUserRole>>();
            services.TryAddScoped<IdentityErrorDescriber>();
            services.TryAddScoped<ISecurityStampValidator, SecurityStampValidator<Identity.Models.ApplicationUser>>();
            services.TryAddScoped<IUserClaimsPrincipalFactory<Identity.Models.ApplicationUser>, UserClaimsPrincipalFactory<Identity.Models.ApplicationUser, Identity.Models.ApplicationUserRole>>();
            //services.TryAddScoped<ApplicationIdentityDbContext<Identity.Models.Identity.Models.ApplicationUser, Identity.Models.ApplicationUserRole>, ApplicationIdentityDbContext<Identity.Models.Identity.Models.ApplicationUser, Identity.Models.ApplicationUserRole>>();
            services.TryAddScoped<ApplicationUserStore, ApplicationUserStore>();
            services.TryAddScoped<ApplicationUserManager, ApplicationUserManager>();
            services.TryAddScoped<ApplicationSignInManager, ApplicationSignInManager>();
            services.TryAddScoped<RoleManager<Identity.Models.ApplicationUserRole>, AspNetRoleManager<Identity.Models.ApplicationUserRole>>();

            if (setupAction != null)
            {
                services.Configure(setupAction);
            }

            return new IdentityBuilder(typeof(Identity.Models.ApplicationUser), typeof(Identity.Models.ApplicationUserRole), services);
        }
    }
}
