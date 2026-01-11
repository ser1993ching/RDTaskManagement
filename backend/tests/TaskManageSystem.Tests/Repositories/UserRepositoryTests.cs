using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;
using TaskManageSystem.Infrastructure.Data;
using TaskManageSystem.Infrastructure.Repositories;

namespace TaskManageSystem.Tests.Repositories;

/// <summary>
/// 用户仓储测试
/// </summary>
public class UserRepositoryTests
{
    [Fact]
    public async Task GetByIdAsync_ExistingUser_ReturnsUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);

        // Act
        var result = await repository.GetByIdAsync("USER001");

        // Assert
        result.Should().NotBeNull();
        result!.UserID.Should().Be("USER001");
        result.Name.Should().Be("李研�?);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingUser_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        var repository = new UserRepository(context);

        // Act
        var result = await repository.GetByIdAsync("NONEXISTENT");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllNonDeletedUsers()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);

        // Act
        var result = await repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetByRoleAsync_ReturnsUsersWithSpecifiedRole()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);

        // Act
        var result = await repository.GetByRoleAsync(SystemRole.Member);

        // Assert
        result.Should().HaveCount(1);
        result.First().UserID.Should().Be("USER001");
    }

    [Fact]
    public async Task CreateAsync_AddsNewUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        var repository = new UserRepository(context);

        var newUser = new User
        {
            UserID = "NEWUSER",
            Name = "新用�?,
            SystemRole = SystemRole.Member,
            OfficeLocation = OfficeLocation.Chengdu,
            Status = PersonnelStatus.Active,
            PasswordHash = "hashedpassword"
        };

        // Act
        var result = await repository.CreateAsync(newUser);

        // Assert
        result.Should().NotBeNull();
        result.UserID.Should().Be("NEWUSER");

        // Verify in database
        var savedUser = await repository.GetByIdAsync("NEWUSER");
        savedUser.Should().NotBeNull();
    }

    [Fact]
    public async Task SoftDeleteAsync_MarksUserAsDeleted()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);

        // Act
        var result = await repository.SoftDeleteAsync("USER001");

        // Assert
        result.Should().BeTrue();

        // Verify soft deleted
        var deletedUser = await repository.GetByIdAsync("USER001");
        deletedUser.Should().BeNull();

        // But still exists in database (with IsDeleted = true)
        var userWithIncludes = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.UserID == "USER001");
        userWithIncludes.Should().NotBeNull();
        userWithIncludes!.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task RestoreAsync_RestoresDeletedUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);

        // First soft delete
        await repository.SoftDeleteAsync("USER001");

        // Act
        var result = await repository.RestoreAsync("USER001");

        // Assert
        result.Should().BeTrue();

        // Verify restored
        var restoredUser = await repository.GetByIdAsync("USER001");
        restoredUser.Should().NotBeNull();
        restoredUser!.Name.Should().Be("李研�?);
    }

    [Fact]
    public async Task GetByCredentialsAsync_ValidCredentials_ReturnsUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);

        // Act
        var result = await repository.GetByCredentialsAsync("USER001", "123");

        // Assert
        result.Should().NotBeNull();
        result!.UserID.Should().Be("USER001");
    }

    [Fact]
    public async Task GetByCredentialsAsync_InvalidCredentials_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);

        // Act
        var result = await repository.GetByCredentialsAsync("USER001", "wrongpassword");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ExistsAsync_ExistingUser_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        await SeedTestUsers(context);

        var repository = new UserRepository(context);

        // Act
        var result = await repository.ExistsAsync("USER001");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_NonExistingUser_ReturnsFalse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using var context = new AppDbContext(options);
        var repository = new UserRepository(context);

        // Act
        var result = await repository.ExistsAsync("NONEXISTENT");

        // Assert
        result.Should().BeFalse();
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
