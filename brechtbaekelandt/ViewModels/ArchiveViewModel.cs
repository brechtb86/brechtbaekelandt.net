using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.ViewModels
{
    public class ArchiveViewModel : BaseViewModel
    {
        public ICollection<KeyValuePair<string, ICollection<ArchivedPost>>> ArchivedPosts { get; set; }
    }
}
