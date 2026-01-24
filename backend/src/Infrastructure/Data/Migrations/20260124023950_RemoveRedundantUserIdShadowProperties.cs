using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManageSystem.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveRedundantUserIdShadowProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 删除多余的外键（如果存在）
            migrationBuilder.DropForeignKey(
                name: "FK_tasks_users_UserID",
                table: "tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_tasks_users_UserID1",
                table: "tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_tasks_users_UserID2",
                table: "tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_tasks_users_UserID3",
                table: "tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_tasks_users_UserID4",
                table: "tasks");

            // 删除多余的索引
            migrationBuilder.DropIndex(
                name: "IX_tasks_UserID",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_tasks_UserID1",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_tasks_UserID2",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_tasks_UserID3",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_tasks_UserID4",
                table: "tasks");

            // 删除多余的 UserID 列
            migrationBuilder.DropColumn(
                name: "UserID",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "UserID1",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "UserID2",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "UserID3",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "UserID4",
                table: "tasks");

            // 更新种子数据时间戳
            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC001",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2095));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC002",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2099));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC003",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2100));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC004",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2101));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC005",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2102));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC006",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2103));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC007",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2104));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC008",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2105));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC009",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2106));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC010",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 39, 49, 880, DateTimeKind.Utc).AddTicks(2106));

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "UserID",
                keyValue: "admin",
                column: "PasswordHash",
                value: "$2a$11$FAMHDGXReJhStFAfXZKODOZxfWK.d3QYVU4xL02rnIikDP.5ZTggu");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "UserID",
                keyValue: "LEADER001",
                column: "PasswordHash",
                value: "$2a$11$GyTZWGAt.JGm3Dp3jf3keOxXLseZE3rc5MOdA029t2AEc3aIgnW7y");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "UserID",
                keyValue: "USER001",
                column: "PasswordHash",
                value: "$2a$11$kkpSrXh4cDiXqAGRFrbYT.mESnXOKWw.2.68ObojrWnuYxUq6SVyu");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 恢复 UserID 列
            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "tasks",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID1",
                table: "tasks",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID2",
                table: "tasks",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID3",
                table: "tasks",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserID4",
                table: "tasks",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tasks_UserID",
                table: "tasks",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_UserID1",
                table: "tasks",
                column: "UserID1");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_UserID2",
                table: "tasks",
                column: "UserID2");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_UserID3",
                table: "tasks",
                column: "UserID3");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_UserID4",
                table: "tasks",
                column: "UserID4");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_users_UserID",
                table: "tasks",
                column: "UserID",
                principalTable: "users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_users_UserID1",
                table: "tasks",
                column: "UserID1",
                principalTable: "users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_users_UserID2",
                table: "tasks",
                column: "UserID2",
                principalTable: "users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_users_UserID3",
                table: "tasks",
                column: "UserID3",
                principalTable: "users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_users_UserID4",
                table: "tasks",
                column: "UserID4",
                principalTable: "users",
                principalColumn: "UserID");

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC001",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1234));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC002",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1239));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC003",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1240));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC004",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1241));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC005",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1242));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC006",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1243));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC007",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1244));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC008",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1245));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC009",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1246));

            migrationBuilder.UpdateData(
                table: "task_classes",
                keyColumn: "Id",
                keyValue: "TC010",
                column: "CreatedAt",
                value: new DateTime(2026, 1, 24, 2, 38, 35, 175, DateTimeKind.Utc).AddTicks(1247));

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "UserID",
                keyValue: "admin",
                column: "PasswordHash",
                value: "$2a$11$mtUROIF5PCLK0mkHfBfc7udbB4CXxWKBScA1.Tye1JkzQnPa8qNQ2");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "UserID",
                keyValue: "LEADER001",
                column: "PasswordHash",
                value: "$2a$11$NOT.m/3.8SS1Txltx0TkJuH.UjVc14arF5rxIPLS1Mlh7aoYJtuKO");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "UserID",
                keyValue: "USER001",
                column: "PasswordHash",
                value: "$2a$11$3G1UFwzKM/iTjl1PiedodeSh74xuMRGv5jOEwUWCYJ7970y841TLG");
        }
    }
}
