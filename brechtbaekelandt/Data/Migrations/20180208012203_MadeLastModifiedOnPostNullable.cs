using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace brechtbaekelandt.data.migrations
{
    public partial class MadeLastModifiedOnPostNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "LastModified",
                table: "Posts",
                nullable: true,
                oldClrType: typeof(DateTime));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "LastModified",
                table: "Posts",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldNullable: true);
        }
    }
}
