namespace brechtbaekelandt.Identity.Models
{
    public class ApplicationUserWithPassword : ApplicationUser
    {
        public string Password { get; set; }
    }
}
