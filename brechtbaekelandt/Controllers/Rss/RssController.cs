using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace brechtbaekelandt.Controllers.Rss
{
    [Produces("application/xml")]
    [Route("rss")]
    public class RssController : Controller
    {
    }
}