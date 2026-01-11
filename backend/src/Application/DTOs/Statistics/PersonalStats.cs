namespace R&DTaskSystem.Application.DTOs.Statistics;

/// <summary>
/// 类别分布项
/// </summary>
public class CategoryDistributionItem
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

/// <summary>
/// 差旅统计
/// </summary>
public class TravelStats
{
    public decimal TotalDays { get; set; }
    public decimal WorkHoursInPeriod { get; set; }
    public double Percentage { get; set; }
}

/// <summary>
/// 会议统计
/// </summary>
public class MeetingStats
{
    public decimal TotalHours { get; set; }
    public decimal WorkHoursInPeriod { get; set; }
    public double Percentage { get; set; }
}

/// <summary>
/// 月度趋势项
/// </summary>
public class MonthlyTrendItem
{
    public string Month { get; set; } = string.Empty;  // YYYY-MM
    public int Assigned { get; set; }
    public int Completed { get; set; }
}

/// <summary>
/// 团队成员统计项
/// </summary>
public class TeamMemberStats
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int TotalCount { get; set; }
    public int CompletedCount { get; set; }
    public double CompletionRate { get; set; }
    public decimal Workload { get; set; }
}

/// <summary>
/// 个人统计数据
/// </summary>
public class PersonalStats
{
    public int InProgressCount { get; set; }
    public int PendingCount { get; set; }
    public int CompletedCount { get; set; }
    public int TotalCount { get; set; }
    public double CompletionRate { get; set; }
    public List<CategoryDistributionItem> CategoryDistribution { get; set; } = new();
    public TravelStats TravelStats { get; set; } = new();
    public MeetingStats MeetingStats { get; set; } = new();
    public List<MonthlyTrendItem> MonthlyTrend { get; set; } = new();
}

/// <summary>
/// 团队统计
/// </summary>
public class TeamStats
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double CompletionRate { get; set; }
    public List<TeamMemberStats> ByUser { get; set; } = new();
    public List<CategoryDistributionItem> ByCategory { get; set; } = new();
    public List<TaskDto> OverdueTasks { get; set; } = new();
    public List<TaskDto> LongRunningTasks { get; set; } = new();
}

/// <summary>
/// 任务统计查询参数
/// </summary>
public class StatisticsQueryParams
{
    public string? UserId { get; set; }
    public string? Period { get; set; }  // week, month, quarter, halfYear, year, yearAndHalf
    public string? OfficeLocation { get; set; }
}
