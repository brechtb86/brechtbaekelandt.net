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

I haven't implemented a registration page, but in `HomeController.cs` you will find some code to add a user.

```csharp
// Create a user for the first time, can be removed or commented out after first run.
//Task.Run(async () =>
//{
//    const string userName = "Tester";
//    const string password = "myC0mplExPas$woRd";
//    const string firstName = "Tester";
//    const string lastName = "McTestFace";
//    const string emailAddress = "tester@microsoft.com";
//    const bool isAdmin = true;

//    var id = Guid.NewGuid();

//    var user = await this._applicationUserManager.FindByNameAsync(userName);

//    if (user == null)
//    {
//        await this._applicationUserManager.CreateUserAsync(id, userName, password, emailAddress, firstName, lastName, isAdmin);

//        this._blogDbContext.Users.Add(new Data.Entities.User { UserName = userName, EmailAddress = emailAddress, FirstName = firstName, LastName = lastName, IsAdmin = isAdmin });

//        await this._blogDbContext.SaveChangesAsync();
//    }
//});
```