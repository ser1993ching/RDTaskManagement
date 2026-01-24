using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManageSystem.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTaskFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 删除 CapacityLevel 列
            migrationBuilder.DropColumn(
                name: "CapacityLevel",
                table: "tasks");

            // 添加 RelatedProject 列
            migrationBuilder.AddColumn<string>(
                name: "RelatedProject",
                table: "tasks",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true);

            // 添加 IsIndependentBusinessUnit 列
            migrationBuilder.AddColumn<bool>(
                name: "IsIndependentBusinessUnit",
                table: "tasks",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 回滚：删除新增的列
            migrationBuilder.DropColumn(
                name: "RelatedProject",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "IsIndependentBusinessUnit",
                table: "tasks");

            // 恢复 CapacityLevel 列
            migrationBuilder.AddColumn<string>(
                name: "CapacityLevel",
                table: "tasks",
                type: "longtext",
                nullable: true);
        }
    }
}
