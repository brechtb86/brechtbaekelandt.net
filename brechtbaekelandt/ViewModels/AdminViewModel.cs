using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.ViewModels
{
    public class AdminViewModel
    {
        public User CurrentUser { get; set; }

        public ICollection<Category> Categories { get; set; }
    }
}
