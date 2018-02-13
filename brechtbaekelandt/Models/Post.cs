using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using brechtbaekelandt.Extensions;

namespace brechtbaekelandt.Models
{
    public class Post : Base
    {
        public DateTime Created { get; set; }

        public DateTime? LastModified { get; set; }

        public bool IsPostVisible { get; set; }

        [Required(ErrorMessage= "you didn't fill in the title!")]
        public string Title { get; set; }

        public string CleanTitle => !string.IsNullOrEmpty(this.Title) ? Regex.Replace(this.Title, "<.*?>", string.Empty) : string.Empty;

        public string InternalTitle => this.Title.RemoveSpecialCharactersAndSpaces().ToLower();

        public string Url => $"/blog/post/{this.InternalTitle}";

        [Required(ErrorMessage = "you didn't fill in the description!")]
        public string Description { get; set; }

        public string CleanDescription => !string.IsNullOrEmpty(this.Description) ? Regex.Replace(this.Description, "<.*?>", string.Empty) : string.Empty;

        public string DescriptionWithPicture => !string.IsNullOrEmpty(this.PictureUrl) ? Description.Insert(Description.IndexOf('>') + 1, $"<a href=\"{this.PictureUrl}\" data-fancybox data-caption=\"{this.Title}\"><img src=\"{this.PictureUrl}\" class=\"post-picture post-preview-picture img-thumbnail\" /></a>") : this.Description;

        public string Content { get; set; }

        public string CleanContent => !string.IsNullOrEmpty(this.Content) ? Regex.Replace(this.Content, "<.*?>", string.Empty) : string.Empty;

        public virtual User User { get; set; }

        public string PictureUrl { get; set; }

        public string[] Tags { get; set; }

        public int Likes { get; set; }

        [Required(ErrorMessage = "you didn't select a category!")]
        public virtual ICollection<Category> Categories { get; set; }

        public virtual ICollection<Comment> Comments { get; set; }

        public virtual ICollection<Attachment> Attachments { get; set; }
    }
}