using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using R&DTaskSystem.Application.DTOs.Tasks;
using R&DTaskSystem.Application.Services;
using R&DTaskSystem.Domain.Entities;
using R&DTaskSystem.Domain.Enums;
using R&DTaskSystem.Infrastructure.Data;
using R&DTaskSystem.Infrastructure.Repositories;

namespace R&DTaskSystem.Tests.Services;

/// <summary>
/// 任务服务测试
/// </summary>
public class TaskServiceTests : TestBase
{
    [Fact]
    public async Task GetTasksAsync_ReturnsAllTasks()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTasks(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        var query = new TaskQueryParams { Page = 1, PageSize = 10 };

        // Act
        var result = await service.GetTasksAsync(query);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(2);
        result.Total.Should().Be(2);
    }

    [Fact]
    public async Task GetTaskByIdAsync_ExistingTask_ReturnsTask()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTasks(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        // Act
        var result = await service.GetTaskByIdAsync("T001");

        // Assert
        result.Should().NotBeNull();
        result!.TaskID.Should().Be("T001");
        result.TaskName.Should().Be("测试任务1");
    }

    [Fact]
    public async Task CreateTaskAsync_ValidRequest_CreatesTask()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTaskClasses(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        var request = new CreateTaskRequest
        {
            TaskName = "新任务",
            TaskClassID = "TC001",
            Category = "标书",
            AssigneeID = "USER001",
            StartDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(7)
        };

        // Act
        var result = await service.CreateTaskAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.TaskName.Should().Be("新任务");
        result.TaskID.Should().StartWith("T-");
        result.Status.Should().Be("未开始");
    }

    [Fact]
    public async Task UpdateTaskStatusAsync_ValidStatus_UpdatesTask()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTasks(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        // Act
        var result = await service.UpdateTaskStatusAsync("T001", "编制中");

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be("编制中");
    }

    [Fact]
    public async Task UpdateRoleStatusAsync_AssigneeRole_UpdatesRoleStatus()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTasks(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        var request = new UpdateRoleStatusRequest
        {
            Role = "assignee",
            Status = "进行中"
        };

        // Act
        var result = await service.UpdateRoleStatusAsync("T001", request);

        // Assert
        result.Should().NotBeNull();
        result.AssigneeStatus.Should().Be("进行中");
    }

    [Fact]
    public async Task CompleteAllRolesAsync_UpdatesAllRolesToCompleted()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTasks(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        // Act
        var result = await service.CompleteAllRolesAsync("T001");

        // Assert
        result.Should().NotBeNull();
        result.Status.Should().Be("已完成");
        result.AssigneeStatus.Should().Be("已完成");
        result.CheckerStatus.Should().Be("已完成");
    }

    [Fact]
    public async Task SoftDeleteTaskAsync_ExistingTask_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTasks(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        // Act
        var result = await service.SoftDeleteTaskAsync("T001");

        // Assert
        result.Should().BeTrue();

        // Verify soft deleted
        var deletedTask = await service.GetTaskByIdAsync("T001");
        deletedTask.Should().BeNull();
    }

    [Fact]
    public async Task GetPersonalTasksAsync_ReturnsTasksRelatedToUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTasks(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        // Act
        var result = await service.GetPersonalTasksAsync("USER001");

        // Assert
        result.Should().NotBeNull();
        result.InProgress.Should().NotBeEmpty();
    }

    [Fact]
    public async Task IsLongRunningTaskAsync_TaskOlderThan60Days_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedLongRunningTask(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        // Act
        var result = await service.IsLongRunningTaskAsync("T001");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetTasksAsync_WithStatusFilter_ReturnsFilteredTasks()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTasks(context);

        var repository = new TaskRepository(context);
        var service = new TaskService(repository, _mapper);

        var query = new TaskQueryParams
        {
            Page = 1,
            PageSize = 10,
            Status = "未开始"
        };

        // Act
        var result = await service.GetTasksAsync(query);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data.All(t => t.Status == "未开始").Should().BeTrue();
    }

    private static async Task SeedTestTasks(AppDbContext context)
    {
        await SeedTestTaskClasses(context);

        var tasks = new List<Task>
        {
            new()
            {
                TaskID = "T001",
                TaskName = "测试任务1",
                TaskClassID = "TC001",
                Category = "标书",
                AssigneeID = "USER001",
                Status = TaskStatus.NotStarted,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = "admin"
            },
            new()
            {
                TaskID = "T002",
                TaskName = "测试任务2",
                TaskClassID = "TC002",
                Category = "搭建生产资料",
                AssigneeID = "USER001",
                Status = TaskStatus.Drafting,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = "admin"
            }
        };

        context.Tasks.AddRange(tasks);
        await context.SaveChangesAsync();
    }

    private static async Task SeedLongRunningTask(AppDbContext context)
    {
        var task = new Task
        {
            TaskID = "T001",
            TaskName = "长期任务",
            TaskClassID = "TC001",
            Category = "标书",
            Status = TaskStatus.NotStarted,
            CreatedDate = DateTime.UtcNow.AddDays(-90), // 90天前创建
            CreatedBy = "admin"
        };

        context.Tasks.Add(task);
        await context.SaveChangesAsync();
    }

    private static async Task SeedTestTaskClasses(AppDbContext context)
    {
        var taskClasses = new List<TaskClass>
        {
            new() { Id = "TC001", Name = "市场配合", Code = TaskClassCode.Market },
            new() { Id = "TC002", Name = "常规项目执行", Code = TaskClassCode.Execution }
        };

        context.TaskClasses.AddRange(taskClasses);
        await context.SaveChangesAsync();
    }
}
