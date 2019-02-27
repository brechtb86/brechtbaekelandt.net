using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using brechtbaekelandt.Extensions;

namespace brechtbaekelandt.Models
{
    public class ArchivedPost
    {
        public string Title { get; set; }
        
        public string InternalTitle => this.Title.RemoveSpecialCharactersAndSpaces().ToLower();

        public string Url => $"/blog/post/{this.InternalTitle}";
    }
}
