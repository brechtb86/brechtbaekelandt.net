using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using brechtbaekelandt.Extensions;

namespace brechtbaekelandt.Models
{
    public class Post : Base
    {
        private string _description;

        public DateTime Created { get; set; }

        public DateTime LastModified { get; set; }

        public string Title { get; set; }

        public string CleanTitle => !string.IsNullOrEmpty(this.Title) ? Regex.Replace(this.Title, "<.*?>", string.Empty) : string.Empty;

        public string InternalTitle => this.Title.RemoveSpecialCharactersAndSpaces().ToLower();

        public string Description
        {
            get => this.InsertPictureInDescription(this.Title, this._description, this.PictureUrl);
            set => this._description = value;
        }

        public string CleanDescription => !string.IsNullOrEmpty(this.Description) ? Regex.Replace(this.Description, "<.*?>", string.Empty) : string.Empty;

        public string Content { get; set; }

        public string CleanContent => !string.IsNullOrEmpty(this.Content) ? Regex.Replace(this.Content, "<.*?>", string.Empty) : string.Empty;

        public virtual User User { get; set; }

        public string PictureUrl { get; set; }

        public string[] Tags { get; set; }

        public virtual ICollection<Category> Categories { get; set; }

        public virtual ICollection<Comment> Comments { get; set; }

        private string InsertPictureInDescription(string title, string description, string pictureUrl)
        {
            return !string.IsNullOrEmpty(pictureUrl) ? description.Insert(description.IndexOf('>') + 1, $"<a href='{pictureUrl}' data-fancybox data-caption='{title}'><img src='{pictureUrl}' class='post-picture post-preview-picture img-thumbnail' /></a>") : description;
        }
    }
}