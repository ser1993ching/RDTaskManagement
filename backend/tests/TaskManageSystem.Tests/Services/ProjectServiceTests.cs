using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Application.DTOs.Projects;
using TaskManageSystem.Application.Services;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;
using TaskManageSystem.Infrastructure.Data;
using TaskManageSystem.Infrastructure.Repositories;

namespace TaskManageSystem.Tests.Services;

/// <summary>
/// 项目服务测试
/// </summary>
public class ProjectServiceTests : TestBase
{
    [Fact]
    public async Task GetProjectsAsync_ReturnsAllProjects()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestProjects(context);

        var repository = new ProjectRepository(context);
        var service = new ProjectService(repository, _mapper);

        var query = new ProjectQueryParams { Page = 1, PageSize = 10 };

        // Act
        var result = await service.GetProjectsAsync(query);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(2);
        result.Total.Should().Be(2);
    }

    [Fact]
    public async Task GetProjectByIdAsync_ExistingProject_ReturnsProject()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestProjects(context);

        var repository = new ProjectRepository(context);
        var service = new ProjectService(repository, _mapper);

        // Act
        var result = await service.GetProjectByIdAsync("P001");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("P001");
        result.Name.Should().Be("测试市场项目");
    }

    [Fact]
    public async Task CreateProjectAsync_ValidRequest_CreatesProject()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        var repository = new ProjectRepository(context);
        var service = new ProjectService(repository, _mapper);

        var request = new CreateProjectRequest
        {
            Name = "新项�?,
            Category = "市场配合项目",
            WorkNo = "MARKET-2025-001",
            Capacity = "1000MW",
            Model = "Francis",
            IsWon = true,
            IsForeign = false
        };

        // Act
        var result = await service.CreateProjectAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("新项�?);
        result.Category.Should().Be("市场配合项目");
        result.Id.Should().StartWith("P-");
    }

    [Fact]
    public async Task UpdateProjectAsync_ValidRequest_UpdatesProject()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestProjects(context);

        var repository = new ProjectRepository(context);
        var service = new ProjectService(repository, _mapper);

        var request = new UpdateProjectRequest
        {
            Name = "更新后的项目名称",
            IsWon = false
        };

        // Act
        var result = await service.UpdateProjectAsync("P001", request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("更新后的项目名称");
        result.IsWon.Should().BeFalse();
    }

    [Fact]
    public async Task SoftDeleteProjectAsync_ExistingProject_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestProjects(context);

        var repository = new ProjectRepository(context);
        var service = new ProjectService(repository, _mapper);

        // Act
        var result = await service.SoftDeleteProjectAsync("P001");

        // Assert
        result.Should().BeTrue();

        // Verify soft deleted
        var deletedProject = await service.GetProjectByIdAsync("P001");
        deletedProject.Should().BeNull();
    }

    [Fact]
    public async Task IsProjectInUseAsync_ProjectWithTasks_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestProjectsWithTasks(context);

        var repository = new ProjectRepository(context);
        var service = new ProjectService(repository, _mapper);

        // Act
        var result = await service.IsProjectInUseAsync("P001");

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
        await SeedTestProjects(context);

        var repository = new ProjectRepository(context);
        var service = new ProjectService(repository, _mapper);

        // Act
        var result = await service.GetStatisticsAsync(null);

        // Assert
        result.Should().NotBeNull();
        result.Total.Should().Be(2);
        result.KeyProjects.Should().Be(1);
    }

    [Fact]
    public async Task GetProjectsAsync_WithCategoryFilter_ReturnsFilteredProjects()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestProjects(context);

        var repository = new ProjectRepository(context);
        var service = new ProjectService(repository, _mapper);

        var query = new ProjectQueryParams
        {
            Page = 1,
            PageSize = 10,
            Category = "市场配合项目"
        };

        // Act
        var result = await service.GetProjectsAsync(query);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data.All(p => p.Category == "市场配合项目").Should().BeTrue();
    }

    private static async Task SeedTestProjects(AppDbContext context)
    {
        var projects = new List<Project>
        {
            new()
            {
                Id = "P001",
                Name = "测试市场项目",
                Category = ProjectCategory.Market,
                WorkNo = "MARKET-2025-001",
                Capacity = "1000MW",
                Model = "Francis",
                IsWon = true,
                IsForeign = false,
                IsKeyProject = true,
                StartDate = DateTime.UtcNow.AddDays(-10)
            },
            new()
            {
                Id = "P002",
                Name = "测试常规项目",
                Category = ProjectCategory.Execution,
                WorkNo = "EXEC-2025-001",
                Capacity = "500MW",
                Model = "Kaplan",
                IsCommissioned = false,
                StartDate = DateTime.UtcNow.AddDays(-5)
            }
        };

        context.Projects.AddRange(projects);
        await context.SaveChangesAsync();
    }

    private static async Task SeedTestProjectsWithTasks(AppDbContext context)
    {
        var project = new Project
        {
            Id = "P001",
            Name = "测试市场项目",
            Category = ProjectCategory.Market,
            WorkNo = "MARKET-2025-001"
        };

        var task = new Task
        {
            TaskID = "T001",
            TaskName = "测试任务",
            TaskClassID = "TC001",
            Category = "标书",
            ProjectID = "P001",
            Status = TaskStatus.NotStarted,
            CreatedDate = DateTime.UtcNow,
            CreatedBy = "admin"
        };

        context.Projects.Add(project);
        context.Tasks.Add(task);
        await context.SaveChangesAsync();
    }
}
