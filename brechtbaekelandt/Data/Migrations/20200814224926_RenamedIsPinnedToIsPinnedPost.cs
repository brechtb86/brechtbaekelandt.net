using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace brechtbaekelandt.Data.Migrations
{
    public partial class RenamedIsPinnedToIsPinnedPost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsPinned",
                table: "Posts",
                newName: "IsPostPinned");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsPostPinned",
                table: "Posts",
                newName: "IsPinned");
        }
    }
}
