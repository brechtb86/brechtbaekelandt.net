using System.ComponentModel.DataAnnotations;

namespace brechtbaekelandt.ViewModels
{
    public class SignInViewModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public bool RememberMe { get; set; }
    }
}
