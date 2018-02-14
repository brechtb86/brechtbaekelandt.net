using brechtbaekelandt.Models;

namespace brechtbaekelandt.ViewModels
{
    public class PostViewModel : BaseViewModel
    {
        public Post Post { get; set; }

        public string[] SearchTermsFilter { get; set; }
    }
}
