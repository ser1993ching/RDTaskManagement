using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using R&DTaskSystem.Application.DTOs.TaskPool;
using R&DTaskSystem.Application.Services;
using R&DTaskSystem.Domain.Entities;
using R&DTaskSystem.Domain.Enums;
using R&DTaskSystem.Infrastructure.Data;
using R&DTaskSystem.Infrastructure.Repositories;

namespace R&DTaskSystem.Tests.Services;

/// <summary>
/// 任务库服务测试
/// </summary>
public class TaskPoolServiceTests : TestBase
{
    [Fact]
    public async Task GetPoolItemsAsync_ReturnsAllPoolItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestPoolItems(context);

        var taskPoolRepository = new TaskPoolRepository(context);
        var taskRepository = new TaskRepository(context);
        var service = new TaskPoolService(taskPoolRepository, taskRepository, _mapper);

        var query = new TaskPoolQueryParams { Page = 1, PageSize = 10 };

        // Act
        var result = await service.GetPoolItemsAsync(query);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(2);
        result.Total.Should().Be(2);
    }

    [Fact]
    public async Task CreatePoolItemAsync_ValidRequest_CreatesPoolItem()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestTaskClasses(context);

        var taskPoolRepository = new TaskPoolRepository(context);
        var taskRepository = new TaskRepository(context);
        var service = new TaskPoolService(taskPoolRepository, taskRepository, _mapper);

        var request = new CreateTaskPoolItemRequest
        {
            TaskName = "计划任务1",
            TaskClassID = "TC001",
            Category = "标书",
            PersonInChargeID = "USER001",
            DueDate = DateTime.UtcNow.AddDays(14)
        };

        // Act
        var result = await service.CreatePoolItemAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.TaskName.Should().Be("计划任务1");
        result.Id.Should().StartWith("TP-");
    }

    [Fact]
    public async Task AssignTaskAsync_ValidRequest_CreatesTaskAndDeletesPoolItem()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestPoolItems(context);

        var taskPoolRepository = new TaskPoolRepository(context);
        var taskRepository = new TaskRepository(context);
        var service = new TaskPoolService(taskPoolRepository, taskRepository, _mapper);

        var request = new AssignTaskRequest
        {
            AssignToPoolItemId = "TP001",
            AssigneeId = "USER001",
            StartDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(7)
        };

        // Act
        var result = await service.AssignTaskAsync("TP001", request);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.TaskId.Should().StartWith("T-");
        result.TaskPoolItemId.Should().Be("TP001");

        // Verify pool item is soft deleted
        var deletedItem = await service.GetPoolItemByIdAsync("TP001");
        deletedItem.Should().BeNull();
    }

    [Fact]
    public async Task AssignTaskAsync_NonExistingPoolItem_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestPoolItems(context);

        var taskPoolRepository = new TaskPoolRepository(context);
        var taskRepository = new TaskRepository(context);
        var service = new TaskPoolService(taskPoolRepository, taskRepository, _mapper);

        var request = new AssignTaskRequest
        {
            AssignToPoolItemId = "NONEXISTENT",
            AssigneeId = "USER001"
        };

        // Act
        var result = await service.AssignTaskAsync("NONEXISTENT", request);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("不存在");
    }

    [Fact]
    public async Task SoftDeletePoolItemAsync_ExistingItem_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestPoolItems(context);

        var taskPoolRepository = new TaskPoolRepository(context);
        var taskRepository = new TaskRepository(context);
        var service = new TaskPoolService(taskPoolRepository, taskRepository, _mapper);

        // Act
        var result = await service.SoftDeletePoolItemAsync("TP001");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetStatisticsAsync_ReturnsCorrectStats()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestPoolItems(context);

        var taskPoolRepository = new TaskPoolRepository(context);
        var taskRepository = new TaskRepository(context);
        var service = new TaskPoolService(taskPoolRepository, taskRepository, _mapper);

        // Act
        var result = await service.GetStatisticsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Total.Should().Be(2);
    }

    [Fact]
    public async Task DuplicateAsync_ValidRequest_CreatesDuplicate()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestPoolItems(context);

        var taskPoolRepository = new TaskPoolRepository(context);
        var taskRepository = new TaskRepository(context);
        var service = new TaskPoolService(taskPoolRepository, taskRepository, _mapper);

        // Act
        var result = await service.DuplicateAsync("TP001", "复制的任务", DateTime.UtcNow.AddDays(30));

        // Assert
        result.Should().NotBeNull();
        result.TaskName.Should().Be("复制的任务");
        result.Id.Should().NotBe("TP001");
    }

    [Fact]
    public async Task GetPoolItemsAsync_WithTaskClassFilter_ReturnsFilteredItems()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestPoolItems(context);

        var taskPoolRepository = new TaskPoolRepository(context);
        var taskRepository = new TaskRepository(context);
        var service = new TaskPoolService(taskPoolRepository, taskRepository, _mapper);

        var query = new TaskPoolQueryParams
        {
            Page = 1,
            PageSize = 10,
            TaskClassID = "TC001"
        };

        // Act
        var result = await service.GetPoolItemsAsync(query);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data.All(tp => tp.TaskClassID == "TC001").Should().BeTrue();
    }

    private static async Task SeedTestPoolItems(AppDbContext context)
    {
        await SeedTestTaskClasses(context);

        var poolItems = new List<TaskPoolItem>
        {
            new()
            {
                Id = "TP001",
                TaskName = "计划任务1",
                TaskClassID = "TC001",
                Category = "标书",
                PersonInChargeID = "USER001",
                CreatedBy = "admin",
                CreatedDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(14)
            },
            new()
            {
                Id = "TP002",
                TaskName = "计划任务2",
                TaskClassID = "TC002",
                Category = "搭建生产资料",
                CreatedBy = "admin",
                CreatedDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(7)
            }
        };

        context.TaskPoolItems.AddRange(poolItems);
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
