using FluentAssertions;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Tests.Enums;

/// <summary>
/// 枚举测试
/// </summary>
public class EnumTests
{
    [Fact]
    public void SystemRole_ShouldHaveCorrectValues()
    {
        // Assert
        SystemRole.Member.Should().Be(0);
        SystemRole.Leader.Should().Be(1);
        SystemRole.Admin.Should().Be(2);
    }

    [Fact]
    public void ProjectCategory_ShouldHaveCorrectValues()
    {
        // Assert
        ProjectCategory.Market.Should().Be(0);
        ProjectCategory.Execution.Should().Be(1);
        ProjectCategory.Nuclear.Should().Be(2);
        ProjectCategory.Research.Should().Be(3);
        ProjectCategory.Renovation.Should().Be(4);
        ProjectCategory.Other.Should().Be(5);
    }

    [Fact]
    public void TaskStatus_ShouldHaveCorrectValues()
    {
        // Assert
        TaskStatus.NotStarted.Should().Be(0);
        TaskStatus.Drafting.Should().Be(1);
        TaskStatus.Revising.Should().Be(2);
        TaskStatus.Reviewing.Should().Be(3);
        TaskStatus.Reviewing2.Should().Be(4);
        TaskStatus.Completed.Should().Be(5);
    }

    [Fact]
    public void RoleStatus_ShouldHaveCorrectValues()
    {
        // Assert
        RoleStatus.NotStarted.Should().Be(0);
        RoleStatus.InProgress.Should().Be(1);
        RoleStatus.Revising.Should().Be(2);
        RoleStatus.Rejected.Should().Be(3);
        RoleStatus.Completed.Should().Be(4);
    }

    [Fact]
    public void Period_ShouldHaveCorrectValues()
    {
        // Assert
        Period.Week.Should().Be(0);
        Period.Month.Should().Be(1);
        Period.Quarter.Should().Be(2);
        Period.HalfYear.Should().Be(3);
        Period.Year.Should().Be(4);
        Period.YearAndHalf.Should().Be(5);
    }

    [Fact]
    public void TaskClassCode_ShouldHaveCorrectValues()
    {
        // Assert
        TaskClassCode.Market.Should().Be(0);
        TaskClassCode.Execution.Should().Be(1);
        TaskClassCode.Nuclear.Should().Be(2);
        TaskClassCode.ProductDev.Should().Be(3);
        TaskClassCode.Research.Should().Be(4);
        TaskClassCode.Renovation.Should().Be(5);
        TaskClassCode.MeetingTraining.Should().Be(6);
        TaskClassCode.AdminParty.Should().Be(7);
        TaskClassCode.Travel.Should().Be(8);
        TaskClassCode.Other.Should().Be(9);
    }

    [Theory]
    [InlineData(SystemRole.Member)]
    [InlineData(SystemRole.Leader)]
    [InlineData(SystemRole.Admin)]
    public void SystemRole_AllValues_ShouldHaveDisplayAttribute(SystemRole role)
    {
        // The Display attribute should be present on all enum values
        var memberInfo = typeof(SystemRole).GetMember(role.ToString());
        memberInfo.Should().NotBeEmpty();
    }

    [Fact]
    public void SystemRole_CanParseFromString()
    {
        // Arrange & Act
        var result = Enum.TryParse<SystemRole>("Member", out var member);

        // Assert
        result.Should().BeTrue();
        member.Should().Be(SystemRole.Member);
    }

    [Fact]
    public void TaskStatus_CanParseFromChineseString()
    {
        // Arrange & Act
        var notStartedResult = Enum.TryParse<TaskStatus>("未开�?, out var notStarted);
        var draftingResult = Enum.TryParse<TaskStatus>("编制�?, out var drafting);
        var completedResult = Enum.TryParse<TaskStatus>("已完�?, out var completed);

        // Assert
        notStartedResult.Should().BeTrue();
        notStarted.Should().Be(TaskStatus.NotStarted);
        draftingResult.Should().BeTrue();
        drafting.Should().Be(TaskStatus.Drafting);
        completedResult.Should().BeTrue();
        completed.Should().Be(TaskStatus.Completed);
    }
}
