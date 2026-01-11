using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Infrastructure.Data.Configurations;

namespace TaskManageSystem.Infrastructure.Data;

/// <summary>
/// 应用数据库上下文
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskClass> TaskClasses => Set<TaskClass>();
    public DbSet<TaskPoolItem> TaskPoolItems => Set<TaskPoolItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 应用配置
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new ProjectConfiguration());
        modelBuilder.ApplyConfiguration(new TaskConfiguration());
        modelBuilder.ApplyConfiguration(new TaskClassConfiguration());
        modelBuilder.ApplyConfiguration(new TaskPoolItemConfiguration());

        // 种子数据
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // 种子用户
        modelBuilder.Entity<User>().HasData(
            new User
            {
                UserID = "admin",
                Name = "系统管理员",
                SystemRole = Domain.Enums.SystemRole.Admin,
                OfficeLocation = Domain.Enums.OfficeLocation.Chengdu,
                Status = Domain.Enums.PersonnelStatus.Active,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
                CreatedAt = new DateTime(2025, 1, 1)
            },
            new User
            {
                UserID = "LEADER001",
                Name = "张组长",
                SystemRole = Domain.Enums.SystemRole.Leader,
                OfficeLocation = Domain.Enums.OfficeLocation.Deyang,
                Status = Domain.Enums.PersonnelStatus.Active,
                Title = "主任工程师",
                JoinDate = new DateTime(2015, 5, 15),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                CreatedAt = new DateTime(2025, 1, 1)
            },
            new User
            {
                UserID = "USER001",
                Name = "李研究员",
                SystemRole = Domain.Enums.SystemRole.Member,
                OfficeLocation = Domain.Enums.OfficeLocation.Chengdu,
                Status = Domain.Enums.PersonnelStatus.Active,
                Title = "工程师",
                JoinDate = new DateTime(2022, 7, 1),
                Education = "硕士",
                School = "四川大学",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                CreatedAt = new DateTime(2025, 1, 1)
            }
        );

        // 种子任务类别
        modelBuilder.Entity<TaskClass>().HasData(
            new TaskClass { Id = "TC001", Name = "市场配合", Code = Domain.Enums.TaskClassCode.Market, Description = "市场配合相关任务" },
            new TaskClass { Id = "TC002", Name = "常规项目执行", Code = Domain.Enums.TaskClassCode.Execution, Description = "常规项目执行相关任务" },
            new TaskClass { Id = "TC003", Name = "核电项目执行", Code = Domain.Enums.TaskClassCode.Nuclear, Description = "核电项目执行相关任务" },
            new TaskClass { Id = "TC004", Name = "产品研发", Code = Domain.Enums.TaskClassCode.ProductDev, Description = "产品研发相关任务" },
            new TaskClass { Id = "TC005", Name = "科研任务", Code = Domain.Enums.TaskClassCode.Research, Description = "科研项目相关任务" },
            new TaskClass { Id = "TC006", Name = "改造服务", Code = Domain.Enums.TaskClassCode.Renovation, Description = "改造服务相关任务" },
            new TaskClass { Id = "TC007", Name = "内部会议与培训", Code = Domain.Enums.TaskClassCode.MeetingTraining, Description = "会议和培训任务" },
            new TaskClass { Id = "TC008", Name = "行政与党建", Code = Domain.Enums.TaskClassCode.AdminParty, Description = "行政和党建任务" },
            new TaskClass { Id = "TC009", Name = "差旅任务", Code = Domain.Enums.TaskClassCode.Travel, Description = "出差任务" },
            new TaskClass { Id = "TC010", Name = "其他任务", Code = Domain.Enums.TaskClassCode.Other, Description = "其他类型任务" }
        );
    }
}
