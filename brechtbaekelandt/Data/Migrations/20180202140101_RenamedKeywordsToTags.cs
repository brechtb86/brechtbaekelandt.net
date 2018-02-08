using Microsoft.EntityFrameworkCore.Migrations;

namespace brechtbaekelandt.data.migrations
{
    public partial class RenamedKeywordsToTags : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Keywords",
                table: "Posts",
                newName: "Tags");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Tags",
                table: "Posts",
                newName: "Keywords");
        }
    }
}
