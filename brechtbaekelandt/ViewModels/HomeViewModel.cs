using System;
using System.Collections.Generic;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.ViewModels
{
    public class HomeViewModel : BaseViewModel
    {
        public int CurrentPage { get; set; }

        public int TotalPostCount { get; set; }

        public int PostsPerPage { get; set; }

        public string[] Tags { get; set; }

        public string[] TagsFilter { get; set; }

        public string[] SearchTermsFilter { get; set; }

        public Guid? CategoryIdFilter { get; set; }

        public ICollection<string> AllPostsUrls { get; set; }

        public ICollection<Post> Posts { get; set; }

        public ICollection<Post> PinnedPosts { get; set; }

        public ICollection<Category> Categories { get; set; }
    }
}
