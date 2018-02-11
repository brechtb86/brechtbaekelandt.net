using System.Collections.Generic;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.ViewModels
{
    public class AdminViewModel
    {
        public User CurrentUser { get; set; }

        public ICollection<Post> Posts { get; set; }

        public ICollection<Category> Categories { get; set; }

        public ICollection<User> Users { get; set; }     
    }
}
