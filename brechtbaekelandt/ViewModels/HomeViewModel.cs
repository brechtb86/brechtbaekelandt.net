using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.ViewModels
{
    public class HomeViewModel
    {
        public int TotalPostCount { get; set; }

        public int PostsPerPage { get; set; }

        public string[] Keywords { get; set; }

        public ICollection<Post> Posts { get; set; }

        public ICollection<Category> Categories { get; set; }
    }
}
