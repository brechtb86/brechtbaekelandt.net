using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace brechtbaekelandt.data.migrations
{
    public partial class AddedSubscriberEmailSentToPost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "SubscriberEmailSent",
                table: "Posts",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Subscribers",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    EmailAddress = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscribers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriberCategory",
                columns: table => new
                {
                    SubscriberId = table.Column<Guid>(nullable: false),
                    CategoryId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriberCategory", x => new { x.SubscriberId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_SubscriberCategory_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubscriberCategory_Subscribers_SubscriberId",
                        column: x => x.SubscriberId,
                        principalTable: "Subscribers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriberCategory_CategoryId",
                table: "SubscriberCategory",
                column: "CategoryId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubscriberCategory");

            migrationBuilder.DropTable(
                name: "Subscribers");

            migrationBuilder.DropColumn(
                name: "SubscriberEmailSent",
                table: "Posts");
        }
    }
}
