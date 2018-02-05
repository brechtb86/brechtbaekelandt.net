using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Html;

namespace brechtbaekelandt.Extensions
{
    public static class HtmlStringExtensions
    {
        public static HtmlString ToEscapedJSHtmlString(this HtmlString htmlString)
        {
            return new HtmlString($@"{htmlString.Value.Replace("/", "\\/")}");
        }
    }
}
