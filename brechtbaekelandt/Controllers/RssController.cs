using Microsoft.AspNetCore.Mvc;

namespace brechtbaekelandt.Controllers
{
    [Produces("application/xml")]
    public class RssController : Controller
    {
        [HttpGet]
        public IActionResult Index(string categories)
        {


            return this.Ok();
        }
    }
}