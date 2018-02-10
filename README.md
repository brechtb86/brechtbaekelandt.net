# brechtbaekelandt.net

### My personal blog (www.brechtbaekelandt.net)

I decided to make my personal blog open source, so you can base your own blog on this project.

For obvious reasons I omitted the `appsettings.json` file, but I included a template `appsettings.github.json`, nothing fancy, just two connection strings. You can also copy the `appsettings.json` template below.

#### Get started

##### Create the databases

First step is to create two databases, one for Identity and one for the blog data.

##### Change your connection strings

Nex thing is to change the connection strings in `appsettings.json`.

```json
{
  "ConnectionStrings": {
    "Identity": "Server=***;Database=***;Initial Catalog=***;User ID=***;Password=***;Persist Security Info=True;",
    "Blog": "Server=***;Database=***;Initial Catalog=***;User ID=***;Password=***;Persist Security Info=True;"
  }
}
```

##### Apply migrations

Then apply the migrations:

> PM> Update-Database -context ApplicationDbContext

> PM> Update-Database -context BlogDbContext

##### Add a user

To add a user go to /account. Once you added the first user don't forget to set the `[Authorize]` attribute on Controllers\AccountController.cs `Index()`and Controllers\api\AccountController.cs `AddBlogUserAsyncActionResult()`!

```csharp

// Controllers\AccountController.cs

[Authorize]
[HttpGet]
public IActionResult Index()
{
    return this.View();
}

// Controllers\api\AccountController.cs

//[Authorize]
[HttpPost]
[Route("add")]
[ValidationActionFilter]
public async Task<IActionResult> AddBlogUserAsyncActionResult([FromBody] ApplicationUserWithPassword user)
{
    var result = await this._applicationUserManager.CreateUserAsync(Guid.NewGuid(), user.UserName, user.Password, user.EmailAddress, user.FirstName, user.LastName, user.IsAdmin);

    return !result.Succeeded ? this.StatusCode((int)HttpStatusCode.BadRequest, result.Errors.Select(e => e.Description.ToLowerInvariant())) : this.Ok(new { message = "the user was addded." });
}
```