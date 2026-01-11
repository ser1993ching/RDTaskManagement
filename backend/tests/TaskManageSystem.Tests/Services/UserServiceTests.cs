using AutoMapper;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Application.DTOs.Users;
using TaskManageSystem.Application.Services;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;
using TaskManageSystem.Infrastructure.Data;
using TaskManageSystem.Infrastructure.Repositories;

namespace TaskManageSystem.Tests.Services;

/// <summary>
/// 用户服务测试
/// </summary>
public class UserServiceTests : TestBase
{
    [Fact]
    public async Task GetUsersAsync_WithValidQuery_ReturnsPaginatedUsers()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        var query = new UserQueryParams { Page = 1, PageSize = 10 };

        // Act
        var result = await service.GetUsersAsync(query);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(3);
        result.Total.Should().Be(3);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetUserByIdAsync_ExistingUser_ReturnsUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        // Act
        var result = await service.GetUserByIdAsync("USER001");

        // Assert
        result.Should().NotBeNull();
        result!.UserID.Should().Be("USER001");
        result.Name.Should().Be("李研�?);
    }

    [Fact]
    public async Task GetUserByIdAsync_NonExistingUser_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        // Act
        var result = await service.GetUserByIdAsync("NONEXISTENT");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateUserAsync_ValidRequest_CreatesUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        var request = new CreateUserRequest
        {
            UserID = "USER002",
            Name = "王测�?,
            SystemRole = "Member",
            OfficeLocation = "Chengdu",
            Status = "Active",
            Password = "test123"
        };

        // Act
        var result = await service.CreateUserAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.UserID.Should().Be("USER002");
        result.Name.Should().Be("王测�?);
        result.SystemRole.Should().Be("Member");
    }

    [Fact]
    public async Task ValidateCredentialsAsync_ValidCredentials_ReturnsUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        // Act
        var result = await service.ValidateCredentialsAsync("USER001", "123");

        // Assert
        result.Should().NotBeNull();
        result!.UserID.Should().Be("USER001");
    }

    [Fact]
    public async Task ValidateCredentialsAsync_InvalidCredentials_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        // Act
        var result = await service.ValidateCredentialsAsync("USER001", "wrongpassword");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ChangePasswordAsync_ValidCurrentPassword_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        // Act
        var result = await service.ChangePasswordAsync("USER001", "123", "newpassword");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ChangePasswordAsync_InvalidCurrentPassword_ReturnsFalse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        // Act
        var result = await service.ChangePasswordAsync("USER001", "wrongpassword", "newpassword");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetUsersAsync_WithOfficeLocationFilter_ReturnsFilteredUsers()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);
        var service = new UserService(repository, _mapper);

        var query = new UserQueryParams
        {
            Page = 1,
            PageSize = 10,
            OfficeLocation = "Chengdu"
        };

        // Act
        var result = await service.GetUsersAsync(query);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(2); // admin �?USER001 在成�?
        result.Data.All(u => u.OfficeLocation == "Chengdu").Should().BeTrue();
    }

    private static async Task SeedTestUsers(AppDbContext context)
    {
        var users = new List<User>
        {
            new()
            {
                UserID = "admin",
                Name = "系统管理�?,
                SystemRole = SystemRole.Admin,
                OfficeLocation = OfficeLocation.Chengdu,
                Status = PersonnelStatus.Active,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin")
            },
            new()
            {
                UserID = "USER001",
                Name = "李研�?,
                SystemRole = SystemRole.Member,
                OfficeLocation = OfficeLocation.Chengdu,
                Status = PersonnelStatus.Active,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123")
            },
            new()
            {
                UserID = "LEADER001",
                Name = "张组�?,
                SystemRole = SystemRole.Leader,
                OfficeLocation = OfficeLocation.Deyang,
                Status = PersonnelStatus.Active,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123")
            }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();
    }
}
