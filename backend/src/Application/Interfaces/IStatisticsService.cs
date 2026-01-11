namespace R&DTaskSystem.Application.Interfaces;

/// <summary>
/// 统计服务接口
/// </summary>
public interface IStatisticsService
{
    Task<PersonalStats> GetPersonalStatsAsync(string userId, string period);
    Task<PersonalTasksResponse> GetPersonalTasksByStatusAsync(string userId, string period, string? status);
    Task<TravelStatisticsResponse> GetTravelStatisticsAsync(string? userId, string period, string? projectId);
    Task<MeetingStatisticsResponse> GetMeetingStatisticsAsync(string? userId, string period);
    Task<TeamStats> GetTeamStatsAsync(string period, string? officeLocation);
    Task<WorkloadDistribution> GetWorkloadDistributionAsync(string period);
    Task<List<MonthlyTrendItem>> GetMonthlyTrendAsync(string? userId, int months, string period);
    Task<List<DailyTrendItem>> GetDailyTrendAsync(string userId, int days);
    Task<WorkDayInfo> GetWorkDaysAsync(string period);
    Task<byte[]> ExportStatisticsAsync(string userId, string period);
    Task<DelayedTasksResponse> GetDelayedTasksAsync(string? userId, int daysThreshold);
    Task<DelayedTasksResponse> GetOverdueTasksAsync(string? userId);
}

public class TravelStatisticsResponse
{
    public decimal TotalDays { get; set; }
    public int TotalTasks { get; set; }
    public Dictionary<string, int> ByCategory { get; set; } = new();
    public Dictionary<string, int> ByProject { get; set; } = new();
    public List<MonthlyTrendItem> Trend { get; set; } = new();
}

public class MeetingStatisticsResponse
{
    public decimal TotalHours { get; set; }
    public int TotalTasks { get; set; }
    public Dictionary<string, int> ByCategory { get; set; } = new();
    public List<MonthlyTrendItem> Trend { get; set; } = new();
}

public class DailyTrendItem
{
    public string Day { get; set; } = string.Empty;  // MM/DD
    public int Assigned { get; set; }
    public int Completed { get; set; }
}

public class WorkDayInfo
{
    public int WorkDays { get; set; }
    public int WorkHours { get; set; }
}

public class WorkloadDistribution
{
    public List<TeamMemberStats> ByUser { get; set; } = new();
    public List<CategoryDistributionItem> ByCategory { get; set; } = new();
    public decimal TotalWorkload { get; set; }
}

public class DelayedTasksResponse
{
    public List<TaskDto> Tasks { get; set; } = new();
    public int Count { get; set; }
}
