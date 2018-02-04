using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.ViewModels
{
    public class ApiPostsViewModel
    {
        public int CurrentPage { get; set; }

        public int TotalPostCount { get; set; }

        public int PostsPerPage { get; set; }
        
        public ICollection<Post> Posts { get; set; }

        public string[] TagsFilter { get; set; }

        public string[] SearchTermsFilter { get; set; }

        public Guid? CategoryIdFilter { get; set; }
    }
}
