using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace brechtbaekelandt.Filters
{
    public class ValidateAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var modelState = context.ModelState;

            if (!modelState.IsValid)
            {
                context.Result =
                    new BadRequestObjectResult(new { error = "validation", validationErrors = modelState.SelectMany(x => x.Value.Errors) });
            }
        }
    }
}
