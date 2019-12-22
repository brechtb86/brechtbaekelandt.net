using System.Diagnostics;

namespace brechtbaekelandt.ViewModels
{
    public class BaseViewModel
    {
        public string BaseUrl => Debugger.IsAttached ? "http://localhost:52449" : "https://www.brechtbaekelandt.net";
    }
}
