using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HouseRentingSystemApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHousePropertyKind : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Kind",
                table: "Houses",
                type: "int",
                nullable: false,
                defaultValue: 3);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Kind",
                table: "Houses");
        }
    }
}
