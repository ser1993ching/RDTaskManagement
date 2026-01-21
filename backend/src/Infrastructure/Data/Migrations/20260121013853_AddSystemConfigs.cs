using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TaskManageSystem.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemConfigs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "projects",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<int>(type: "int", nullable: false),
                    WorkNo = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Capacity = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Model = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsWon = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsForeign = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsCommissioned = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsCompleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsKeyProject = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Remark = table.Column<string>(type: "LONGTEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_projects", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SystemConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ConfigKey = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConfigCategory = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConfigValue = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemConfigs", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "task_classes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Code = table.Column<int>(type: "int", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notice = table.Column<string>(type: "TEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_task_classes", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    UserID = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SystemRole = table.Column<int>(type: "int", nullable: false),
                    OfficeLocation = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    JoinDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Education = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    School = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PasswordHash = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Remark = table.Column<string>(type: "LONGTEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Id = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.UserID);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "task_pool",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TaskName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TaskClassID = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ProjectID = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ProjectName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonInChargeID = table.Column<string>(type: "varchar(50)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PersonInChargeName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CheckerID = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CheckerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ChiefDesignerID = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ChiefDesignerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApproverID = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApproverName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedBy = table.Column<string>(type: "varchar(50)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedByName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsForceAssessment = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Remark = table.Column<string>(type: "LONGTEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_task_pool", x => x.Id);
                    table.ForeignKey(
                        name: "FK_task_pool_projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_task_pool_task_classes_TaskClassID",
                        column: x => x.TaskClassID,
                        principalTable: "task_classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_task_pool_users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_task_pool_users_PersonInChargeID",
                        column: x => x.PersonInChargeID,
                        principalTable: "users",
                        principalColumn: "UserID");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tasks",
                columns: table => new
                {
                    TaskID = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TaskName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TaskClassID = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ProjectID = table.Column<string>(type: "varchar(50)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssigneeID = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssigneeName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StartDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Workload = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Difficulty = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Remark = table.Column<string>(type: "LONGTEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TravelLocation = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TravelDuration = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TravelLabel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MeetingDuration = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Participants = table.Column<string>(type: "LONGTEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ParticipantNames = table.Column<string>(type: "LONGTEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CapacityLevel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CheckerID = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CheckerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CheckerWorkload = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    CheckerStatus = table.Column<int>(type: "int", nullable: true),
                    ChiefDesignerID = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ChiefDesignerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ChiefDesignerWorkload = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    ChiefDesignerStatus = table.Column<int>(type: "int", nullable: true),
                    ApproverID = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApproverName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApproverWorkload = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    ApproverStatus = table.Column<int>(type: "int", nullable: true),
                    AssigneeStatus = table.Column<int>(type: "int", nullable: true),
                    IsForceAssessment = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsInPool = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    UserID = table.Column<string>(type: "varchar(50)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserID1 = table.Column<string>(type: "varchar(50)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserID2 = table.Column<string>(type: "varchar(50)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserID3 = table.Column<string>(type: "varchar(50)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserID4 = table.Column<string>(type: "varchar(50)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Id = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tasks", x => x.TaskID);
                    table.ForeignKey(
                        name: "FK_tasks_projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "projects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_tasks_task_classes_TaskClassID",
                        column: x => x.TaskClassID,
                        principalTable: "task_classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tasks_users_UserID",
                        column: x => x.UserID,
                        principalTable: "users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_tasks_users_UserID1",
                        column: x => x.UserID1,
                        principalTable: "users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_tasks_users_UserID2",
                        column: x => x.UserID2,
                        principalTable: "users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_tasks_users_UserID3",
                        column: x => x.UserID3,
                        principalTable: "users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_tasks_users_UserID4",
                        column: x => x.UserID4,
                        principalTable: "users",
                        principalColumn: "UserID");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "task_classes",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "IsDeleted", "Name", "Notice", "UpdatedAt" },
                values: new object[,]
                {
                    { "TC001", 0, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4081), "市场配合相关任务", false, "市场配合", null, null },
                    { "TC002", 1, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4089), "常规项目执行相关任务", false, "常规项目执行", null, null },
                    { "TC003", 2, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4091), "核电项目执行相关任务", false, "核电项目执行", null, null },
                    { "TC004", 3, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4092), "产品研发相关任务", false, "产品研发", null, null },
                    { "TC005", 4, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4093), "科研项目相关任务", false, "科研任务", null, null },
                    { "TC006", 5, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4095), "改造服务相关任务", false, "改造服务", null, null },
                    { "TC007", 6, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4096), "会议和培训任务", false, "内部会议与培训", null, null },
                    { "TC008", 7, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4111), "行政和党建任务", false, "行政与党建", null, null },
                    { "TC009", 8, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4113), "出差任务", false, "差旅任务", null, null },
                    { "TC010", 9, new DateTime(2026, 1, 21, 1, 38, 50, 783, DateTimeKind.Utc).AddTicks(4114), "其他类型任务", false, "其他任务", null, null }
                });

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "UserID", "CreatedAt", "Education", "Id", "IsDeleted", "JoinDate", "Name", "OfficeLocation", "PasswordHash", "Remark", "School", "Status", "SystemRole", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { "admin", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, false, null, "系统管理员", 0, "$2a$11$Gp7NKW1KZbYhBivwH9MxCu7rXLZxQ07Es/xXqBgOKXa2AHvHKR59e", null, null, 0, 2, null, null },
                    { "LEADER001", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, false, new DateTime(2015, 5, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "张组长", 1, "$2a$11$2szJBZb/azbTxKJUZuk3HuMQE3IUQYADrfXn0UC7nD7PXMrcf3K2y", null, null, 0, 1, "主任工程师", null },
                    { "USER001", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "硕士", null, false, new DateTime(2022, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "李研究员", 0, "$2a$11$VqwgNplZu27BnWkVQySmdOOMTLWPJuJR9MiJOZl6K8JP6hGgvDgxW", null, "四川大学", 0, 0, "工程师", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_projects_Category",
                table: "projects",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_projects_StartDate",
                table: "projects",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_SystemConfigs_Category",
                table: "SystemConfigs",
                column: "ConfigCategory");

            migrationBuilder.CreateIndex(
                name: "IX_SystemConfigs_Category_Key",
                table: "SystemConfigs",
                columns: new[] { "ConfigCategory", "ConfigKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_task_classes_Code",
                table: "task_classes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_task_pool_CreatedBy",
                table: "task_pool",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_task_pool_CreatedDate",
                table: "task_pool",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_task_pool_PersonInChargeID",
                table: "task_pool",
                column: "PersonInChargeID");

            migrationBuilder.CreateIndex(
                name: "IX_task_pool_ProjectID",
                table: "task_pool",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_task_pool_TaskClassID",
                table: "task_pool",
                column: "TaskClassID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_ApproverID",
                table: "tasks",
                column: "ApproverID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_AssigneeID",
                table: "tasks",
                column: "AssigneeID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_CheckerID",
                table: "tasks",
                column: "CheckerID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_CreatedDate",
                table: "tasks",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_ProjectID",
                table: "tasks",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_Status",
                table: "tasks",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_TaskClassID",
                table: "tasks",
                column: "TaskClassID");

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

            migrationBuilder.CreateIndex(
                name: "IX_users_OfficeLocation",
                table: "users",
                column: "OfficeLocation");

            migrationBuilder.CreateIndex(
                name: "IX_users_Status",
                table: "users",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_users_SystemRole",
                table: "users",
                column: "SystemRole");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemConfigs");

            migrationBuilder.DropTable(
                name: "task_pool");

            migrationBuilder.DropTable(
                name: "tasks");

            migrationBuilder.DropTable(
                name: "projects");

            migrationBuilder.DropTable(
                name: "task_classes");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
