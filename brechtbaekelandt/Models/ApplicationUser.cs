namespace brechtbaekelandt.Models
{
    public class ApplicationUser
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string EmailAddress { get; set; }

        public bool IsAdmin { get; set; }
    }
}
