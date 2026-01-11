using FluentAssertions;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Projects;
using TaskManageSystem.Application.DTOs.Tasks;
using TaskManageSystem.Application.DTOs.Users;

namespace TaskManageSystem.Tests.DTOs;

/// <summary>
/// DTO测试
/// </summary>
public class DtoTests
{
    [Fact]
    public void PaginatedResponse_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var response = new PaginatedResponse<string>();

        // Assert
        response.Data.Should().NotBeNull();
        response.Data.Should().BeEmpty();
        response.Total.Should().Be(0);
        response.Page.Should().Be(0);
        response.PageSize.Should().Be(0);
        response.Pages.Should().Be(0);
    }

    [Fact]
    public void PaginatedResponse_WithData_ShouldCalculatePagesCorrectly()
    {
        // Arrange
        var response = new PaginatedResponse<string>
        {
            Data = new List<string> { "item1", "item2", "item3" },
            Total = 25,
            Page = 1,
            PageSize = 10
        };

        // Act
        response.Pages = (int)Math.Ceiling(response.Total / (double)response.PageSize);

        // Assert
        response.Data.Should().HaveCount(3);
        response.Total.Should().Be(25);
        response.Pages.Should().Be(3);
    }

    [Fact]
    public void ApiResponse_Success_ShouldHaveCorrectValues()
    {
        // Arrange
        var response = new ApiResponse<string>
        {
            Success = true,
            Data = "test data",
            Message = "操作成功"
        };

        // Assert
        response.Success.Should().BeTrue();
        response.Data.Should().Be("test data");
        response.Message.Should().Be("操作成功");
        response.Error.Should().BeNull();
    }

    [Fact]
    public void ApiResponse_Failure_ShouldHaveError()
    {
        // Arrange
        var response = new ApiResponse<string>
        {
            Success = false,
            Error = new ApiError { Code = "NOT_FOUND", Message = "资源不存�? }
        };

        // Assert
        response.Success.Should().BeFalse();
        response.Data.Should().BeNull();
        response.Error.Should().NotBeNull();
        response.Error!.Code.Should().Be("NOT_FOUND");
        response.Error.Message.Should().Be("资源不存�?);
    }

    [Fact]
    public void UserDto_DefaultValues_ShouldBeEmpty()
    {
        // Arrange & Act
        var dto = new UserDto();

        // Assert
        dto.UserID.Should().BeEmpty();
        dto.Name.Should().BeEmpty();
        dto.SystemRole.Should().BeEmpty();
        dto.OfficeLocation.Should().BeEmpty();
        dto.Status.Should().BeEmpty();
    }

    [Fact]
    public void ProjectDto_CanSetProperties()
    {
        // Arrange
        var dto = new ProjectDto
        {
            Id = "P001",
            Name = "测试项目",
            Category = "市场配合项目",
            WorkNo = "MARKET-2025-001",
            Capacity = "1000MW",
            Model = "Francis",
            IsWon = true,
            IsForeign = false,
            IsKeyProject = true
        };

        // Assert
        dto.Id.Should().Be("P001");
        dto.Name.Should().Be("测试项目");
        dto.Category.Should().Be("市场配合项目");
        dto.IsWon.Should().BeTrue();
        dto.IsForeign.Should().BeFalse();
    }

    [Fact]
    public void TaskDto_CanSetProperties()
    {
        // Arrange
        var dto = new TaskDto
        {
            TaskID = "T001",
            TaskName = "测试任务",
            TaskClassID = "TC001",
            Category = "标书",
            Status = "未开�?,
            Workload = 16,
            Difficulty = 1.5m,
            IsForceAssessment = true
        };

        // Assert
        dto.TaskID.Should().Be("T001");
        dto.TaskName.Should().Be("测试任务");
        dto.Workload.Should().Be(16);
        dto.Difficulty.Should().Be(1.5m);
    }

    [Fact]
    public void PaginationQuery_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var query = new PaginationQuery();

        // Assert
        query.Page.Should().Be(1);
        query.PageSize.Should().Be(20);
        query.Search.Should().BeNull();
        query.IncludeDeleted.Should().BeFalse();
        query.SortBy.Should().BeNull();
        query.SortOrder.Should().Be("desc");
    }

    [Fact]
    public void CreateProjectRequest_CanSetProperties()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "新项�?,
            Category = "市场配合项目",
            WorkNo = "MARKET-2025-001",
            Capacity = "1000MW",
            IsWon = true,
            IsKeyProject = true
        };

        // Assert
        request.Name.Should().Be("新项�?);
        request.Category.Should().Be("市场配合项目");
        request.IsWon.Should().BeTrue();
    }

    [Fact]
    public void CreateTaskRequest_CanSetProperties()
    {
        // Arrange
        var request = new CreateTaskRequest
        {
            TaskName = "新任�?,
            TaskClassID = "TC001",
            Category = "标书",
            AssigneeID = "USER001",
            Workload = 8,
            Difficulty = 1.0m,
            IsForceAssessment = false,
            Participants = new List<string> { "USER001", "USER002" }
        };

        // Assert
        request.TaskName.Should().Be("新任�?);
        request.TaskClassID.Should().Be("TC001");
        request.Participants.Should().HaveCount(2);
    }
}
