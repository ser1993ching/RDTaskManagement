using AutoMapper;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Statistics;
using TaskManageSystem.Application.DTOs.TaskPool;
using TaskManageSystem.Application.DTOs.Tasks;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Repositories;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 统计服务实现
/// </summary>
public class StatisticsService : IStatisticsService
{
    private readonly ITaskRepository? _taskRepository;
    private readonly IMapper _mapper;

    public StatisticsService(ITaskRepository? taskRepository, IMapper mapper)
    {
        _taskRepository = taskRepository;
        _mapper = mapper;
    }

    public async Task<PersonalStats> GetPersonalStatsAsync(string userId, string period)
    {
        IReadOnlyList<TaskItem> tasks;
        if (_taskRepository != null)
        {
            try { tasks = await _taskRepository.GetPersonalTasksAsync(userId, null); }
            catch { tasks = new List<TaskItem>(); }
        }
        else
        {
            tasks = new List<TaskItem>();
        }

        var inProgress = tasks.Count(t => t.Status != Domain.Enums.TaskStatus.Completed && t.Status != Domain.Enums.TaskStatus.NotStarted);
        var pending = tasks.Count(t => t.Status == Domain.Enums.TaskStatus.NotStarted);
        var completed = tasks.Count(t => t.Status == Domain.Enums.TaskStatus.Completed);
        var total = tasks.Count;

        return new PersonalStats
        {
            InProgressCount = inProgress,
            PendingCount = pending,
            CompletedCount = completed,
            TotalCount = total,
            CompletionRate = total > 0 ? Math.Round((double)completed / total * 100, 2) : 0,
            CategoryDistribution = GetCategoryDistribution(tasks),
            TravelStats = GetTravelStats(tasks),
            MeetingStats = GetMeetingStats(tasks),
            MonthlyTrend = GetMonthlyTrendData(tasks)
        };
    }

    public async Task<PersonalTasksResponse> GetPersonalTasksByStatusAsync(string userId, string period, string? status)
    {
        IReadOnlyList<TaskItem> tasks;
        if (_taskRepository != null)
        {
            try { tasks = await _taskRepository.GetPersonalTasksAsync(userId, status); }
            catch { tasks = new List<TaskItem>(); }
        }
        else
        {
            tasks = new List<TaskItem>();
        }

        return new PersonalTasksResponse
        {
            InProgress = _mapper.Map<List<DTOs.Tasks.TaskDto>>(tasks.Where(t => t.Status != Domain.Enums.TaskStatus.Completed && t.Status != Domain.Enums.TaskStatus.NotStarted)),
            Pending = _mapper.Map<List<DTOs.Tasks.TaskDto>>(tasks.Where(t => t.Status == Domain.Enums.TaskStatus.NotStarted)),
            Completed = _mapper.Map<List<DTOs.Tasks.TaskDto>>(tasks.Where(t => t.Status == Domain.Enums.TaskStatus.Completed))
        };
    }

    public async Task<TravelStatisticsResponse> GetTravelStatisticsAsync(string? userId, string period, string? projectId)
    {
        IReadOnlyList<TaskItem> tasks;
        if (_taskRepository != null)
        {
            try { tasks = await _taskRepository.GetTravelTasksAsync(userId ?? "", period); }
            catch { tasks = new List<TaskItem>(); }
        }
        else
        {
            tasks = new List<TaskItem>();
        }

        var totalDays = tasks.Sum(t => t.TravelDuration ?? 0);

        return new TravelStatisticsResponse
        {
            TotalDays = totalDays,
            TotalTasks = tasks.Count,
            ByCategory = tasks.GroupBy(t => t.TravelLabel ?? "其他").ToDictionary(g => g.Key, g => g.Count()),
            ByProject = tasks.Where(t => !string.IsNullOrEmpty(t.ProjectID)).GroupBy(t => t.ProjectID!).ToDictionary(g => g.Key, g => g.Count()),
            Trend = GetMonthlyTrendData(tasks)
        };
    }

    public async Task<MeetingStatisticsResponse> GetMeetingStatisticsAsync(string? userId, string period)
    {
        var tasks = await _taskRepository.GetMeetingTasksAsync(userId ?? "", period);

        var totalHours = tasks.Sum(t => t.MeetingDuration ?? 0);

        return new MeetingStatisticsResponse
        {
            TotalHours = totalHours,
            TotalTasks = tasks.Count,
            ByCategory = tasks.GroupBy(t => t.Category).ToDictionary(g => g.Key, g => g.Count()),
            Trend = GetMonthlyTrendData(tasks)
        };
    }

    public async Task<TeamStats> GetTeamStatsAsync(string period, string? officeLocation)
    {
        var tasks = await _taskRepository.GetAllAsync();

        var totalTasks = tasks.Count;
        var completedTasks = tasks.Count(t => t.Status == Domain.Enums.TaskStatus.Completed);

        return new TeamStats
        {
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            CompletionRate = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 2) : 0,
            ByUser = new List<TeamMemberStats>(),
            ByCategory = GetCategoryDistribution(tasks),
            OverdueTasks = _mapper.Map<List<DTOs.Tasks.TaskDto>>(await _taskRepository.GetOverdueTasksAsync(null)),
            LongRunningTasks = _mapper.Map<List<DTOs.Tasks.TaskDto>>(await _taskRepository.GetDelayedTasksAsync(null, 60))
        };
    }

    public async Task<WorkloadDistribution> GetWorkloadDistributionAsync(string period)
    {
        var tasks = await _taskRepository.GetAllAsync();

        return new WorkloadDistribution
        {
            ByUser = new List<TeamMemberStats>(),
            ByCategory = GetCategoryDistribution(tasks),
            TotalWorkload = tasks.Sum(t => t.Workload ?? 0)
        };
    }

    public async Task<List<MonthlyTrendItem>> GetMonthlyTrendAsync(string? userId, int months, string period)
    {
        var tasks = string.IsNullOrEmpty(userId)
            ? await _taskRepository.GetAllAsync()
            : await _taskRepository.GetPersonalTasksAsync(userId, null);

        return GetMonthlyTrendData(tasks).Take(months).ToList();
    }

    public async Task<List<DailyTrendItem>> GetDailyTrendAsync(string userId, int days)
    {
        var tasks = await _taskRepository.GetPersonalTasksAsync(userId, null);
        var result = new List<DailyTrendItem>();

        for (int i = days - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddDays(-i);
            var dayStr = date.ToString("MM/dd");
            var dayTasks = tasks.Where(t => t.CreatedDate.Date == date.Date);

            result.Add(new DailyTrendItem
            {
                Day = dayStr,
                Assigned = dayTasks.Count(),
                Completed = dayTasks.Count(t => t.Status == Domain.Enums.TaskStatus.Completed)
            });
        }

        return result;
    }

    public async Task<WorkDayInfo> GetWorkDaysAsync(string period)
    {
        int workDays = 22;  // 默认
        return new WorkDayInfo { WorkDays = workDays, WorkHours = workDays * 8 };
    }

    public async Task<byte[]> ExportStatisticsAsync(string userId, string period)
    {
        var stats = await GetPersonalStatsAsync(userId, period);
        var csv = $"总任务数,已完成,进行中,未开始,完成率\n{stats.TotalCount},{stats.CompletedCount},{stats.InProgressCount},{stats.PendingCount},{stats.CompletionRate}%\n";
        return System.Text.Encoding.UTF8.GetBytes(csv);
    }

    public async Task<DelayedTasksResponse> GetDelayedTasksAsync(string? userId, int daysThreshold)
    {
        var tasks = await _taskRepository.GetDelayedTasksAsync(userId, daysThreshold);
        return new DelayedTasksResponse
        {
            Tasks = _mapper.Map<List<DTOs.Tasks.TaskDto>>(tasks),
            Count = tasks.Count
        };
    }

    public async Task<DelayedTasksResponse> GetOverdueTasksAsync(string? userId)
    {
        var tasks = await _taskRepository.GetOverdueTasksAsync(userId);
        return new DelayedTasksResponse
        {
            Tasks = _mapper.Map<List<DTOs.Tasks.TaskDto>>(tasks),
            Count = tasks.Count
        };
    }

    private List<CategoryDistributionItem> GetCategoryDistribution(IReadOnlyList<TaskItem> tasks)
    {
        var total = tasks.Count;
        if (total == 0) return new List<CategoryDistributionItem>();

        return tasks
            .GroupBy(t => t.TaskClassID)
            .Select(g => new CategoryDistributionItem
            {
                Name = g.Key,
                Count = g.Count(),
                Percentage = Math.Round((double)g.Count() / total * 100, 2)
            })
            .ToList();
    }

    private TravelStats GetTravelStats(IReadOnlyList<TaskItem> tasks)
    {
        var travelTasks = tasks.Where(t => t.TaskClassID == "TC009").ToList();
        var totalDays = travelTasks.Sum(t => t.TravelDuration ?? 0);

        return new TravelStats
        {
            TotalDays = totalDays,
            WorkHoursInPeriod = 176,
            Percentage = totalDays > 0 ? Math.Round((double)(totalDays * 8) / 176 * 100, 2) : 0
        };
    }

    private MeetingStats GetMeetingStats(IReadOnlyList<TaskItem> tasks)
    {
        var meetingTasks = tasks.Where(t => t.TaskClassID == "TC007").ToList();
        var totalHours = meetingTasks.Sum(t => t.MeetingDuration ?? 0);

        return new MeetingStats
        {
            TotalHours = totalHours,
            WorkHoursInPeriod = 176,
            Percentage = totalHours > 0 ? Math.Round((double)totalHours / 176 * 100, 2) : 0
        };
    }

    private List<MonthlyTrendItem> GetMonthlyTrendData(IReadOnlyList<TaskItem> tasks)
    {
        return tasks
            .GroupBy(t => t.CreatedDate.ToString("yyyy-MM"))
            .Select(g => new MonthlyTrendItem
            {
                Month = g.Key,
                Assigned = g.Count(),
                Completed = g.Count(t => t.Status == Domain.Enums.TaskStatus.Completed)
            })
            .OrderBy(x => x.Month)
            .ToList();
    }
}
