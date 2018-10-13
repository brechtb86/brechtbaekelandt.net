using brechtbaekelandt.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;

namespace brechtbaekelandt.Data.Contexts
{

    public class BlogDbContext : DbContext
    {
        public BlogDbContext(DbContextOptions<BlogDbContext> options)
            : base(options)
        {

        }

        public DbSet<Post> Posts { get; set; }

        public DbSet<Comment> Comments { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Subscriber> Subscribers { get; set; }

        public DbSet<Attachment> Attachments { get; set; }


        [DbFunction("RemoveDiacritics", "dbo")]
        public static string RemoveDiacritics(string input)
        {
            throw new NotImplementedException("This method can only be called in LINQ-to-Entities!");
        }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<PostCategory>()
                .HasKey(pc => new { pc.PostId, pc.CategoryId });

            builder.Entity<PostCategory>()
                .HasOne(pc => pc.Post)
                .WithMany(p => p.PostCategories)
                .HasForeignKey(pc => pc.PostId);

            builder.Entity<PostCategory>()
                .HasOne(pc => pc.Category)
                .WithMany(c => c.PostCategories)
                .HasForeignKey(pc => pc.CategoryId);

            builder.Entity<SubscriberCategory>()
                .HasKey(sc => new { subscriberId = sc.SubscriberId, sc.CategoryId });

            builder.Entity<SubscriberCategory>()
                .HasOne(sc => sc.Subscriber)
                .WithMany(s => s.SubscriberCategories)
                .HasForeignKey(sc => sc.SubscriberId);

            builder.Entity<SubscriberCategory>()
                .HasOne(sc => sc.Category)
                .WithMany(c => c.SubscriberCategories)
                .HasForeignKey(sc => sc.CategoryId);

        }
    }
}