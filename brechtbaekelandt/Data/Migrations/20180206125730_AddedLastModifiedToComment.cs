using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace brechtbaekelandt.data.migrations
{
    public partial class AddedLastModifiedToComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastModified",
                table: "Comments",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastModified",
                table: "Comments");
        }
    }
}
