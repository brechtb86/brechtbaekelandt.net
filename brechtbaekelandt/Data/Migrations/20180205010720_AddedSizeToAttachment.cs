using Microsoft.EntityFrameworkCore.Migrations;

namespace brechtbaekelandt.data.migrations
{
    public partial class AddedSizeToAttachment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "Size",
                table: "Attachments",
                nullable: false,
                defaultValue: 0L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Size",
                table: "Attachments");
        }
    }
}
