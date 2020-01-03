using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace brechtbaekelandt.Controllers.WebApi
{
    [Produces("application/json")]
    public abstract class BaseController : Controller
    {
        public string BaseUrl => Debugger.IsAttached ? "http://localhost:52449" : "https://www.brechtbaekelandt.net";
    }
}
