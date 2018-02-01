# brechtbaekelandt.net

###### My personal blog (www.brechtbaekelandt.net)

I decided to make my personal blog open source, so you can base your own blog on this project.

For obvious reasons I omitted the `appsettings.json` file, but I included a template `appsettings.github.json`, nothing fancy, just two connection strings. You can also copy the `appsettings.json` template below:

```
{
  "ConnectionStrings": {
    "Identity": "Server=***;Database=***;Initial Catalog=***;User ID=***;Password=***;Persist Security Info=True;",
    "Blog": "Server=***;Database=***;Initial Catalog=***;User ID=***;Password=***;Persist Security Info=True;"
  }
}
```

