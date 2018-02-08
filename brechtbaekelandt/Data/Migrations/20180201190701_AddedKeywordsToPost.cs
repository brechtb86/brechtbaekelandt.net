using Microsoft.EntityFrameworkCore.Migrations;

namespace brechtbaekelandt.Data.migrations
{
    public partial class AddedKeywordsToPost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Keywords",
                table: "Posts",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Keywords",
                table: "Posts");
        }
    }
}
