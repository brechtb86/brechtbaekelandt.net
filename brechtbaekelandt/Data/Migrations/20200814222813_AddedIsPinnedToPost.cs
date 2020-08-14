using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace brechtbaekelandt.Data.Migrations
{
    public partial class AddedIsPinnedToPost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPinned",
                table: "Posts",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPinned",
                table: "Posts");
        }
    }
}
