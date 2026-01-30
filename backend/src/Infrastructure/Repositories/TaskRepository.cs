using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Infrastructure.Data;
using TaskManageSystem.Application.Repositories;

namespace TaskManageSystem.Infrastructure.Repositories;

/// <summary>
/// 任务仓储实现
/// </summary>
public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaskItem?> GetByIdAsync(string taskId)
    {
        return await _context.Tasks.FirstOrDefaultAsync(t => t.TaskID == taskId && !t.IsDeleted);
    }

    public async Task<TaskItem?> GetByIdNoTrackingAsync(string taskId)
    {
        return await _context.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.TaskID == taskId);
    }

    public async Task<IReadOnlyList<TaskItem>> GetAllAsync()
    {
        return await _context.Tasks.Where(t => !t.IsDeleted).OrderByDescending(t => t.CreatedDate).ToListAsync();
    }

    public async Task<IReadOnlyList<TaskItem>> GetByAssigneeAsync(string assigneeId)
    {
        return await _context.Tasks.Where(t => t.AssigneeID == assigneeId && !t.IsDeleted).ToListAsync();
    }

    public async Task<IReadOnlyList<TaskItem>> GetByProjectAsync(string projectId)
    {
        return await _context.Tasks.Where(t => t.ProjectID == projectId && !t.IsDeleted).ToListAsync();
    }

    public async Task<IReadOnlyList<TaskItem>> GetByTaskClassAsync(string taskClassId)
    {
        return await _context.Tasks.Where(t => t.TaskClassID == taskClassId && !t.IsDeleted).ToListAsync();
    }

    public async Task<IReadOnlyList<TaskItem>> GetRelatedToUserAsync(string userId)
    {
        return await _context.Tasks
            .Where(t => !t.IsDeleted && (
                t.AssigneeID == userId ||
                t.CheckerID == userId ||
                t.ChiefDesignerID == userId ||
                t.ApproverID == userId ||
                t.CreatedBy == userId))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<TaskItem>> GetPersonalTasksAsync(string userId, string? status)
    {
        var query = _context.Tasks
            .Where(t => !t.IsDeleted && (
                t.AssigneeID == userId ||
                t.CheckerID == userId ||
                t.ChiefDesignerID == userId ||
                t.ApproverID == userId));

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status.ToString() == status);
        }

        return await query.ToListAsync();
    }

    public async Task<IReadOnlyList<TaskItem>> GetTravelTasksAsync(string userId, string? period)
    {
        // 差旅任务：仅显示负责人（assignee）的任务
        var query = _context.Tasks
            .Where(t => t.TaskClassID == "TC009" && !t.IsDeleted && t.AssigneeID == userId);

        return await query.ToListAsync();
    }

    public async Task<IReadOnlyList<TaskItem>> GetMeetingTasksAsync(string userId, string? period)
    {
        // 会议培训：显示负责人和参会人员列表中的人员
        // Participants 是 JSON 数组格式存储，需要检查是否包含当前用户
        var query = _context.Tasks
            .Where(t => t.TaskClassID == "TC007" && !t.IsDeleted && (
                t.AssigneeID == userId ||
                EF.Functions.JsonContains(t.Participants, $"\"{userId}\"")));

        return await query.ToListAsync();
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        task.CreatedDate = DateTime.UtcNow;
        task.CreatedAt = DateTime.UtcNow;
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<TaskItem> UpdateAsync(TaskItem task)
    {
        task.UpdatedAt = DateTime.UtcNow;

        // 确保实体被正确标记为修改状态
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();

        return task;
    }

    public async Task<bool> SoftDeleteAsync(string taskId)
    {
        var task = await GetByIdAsync(taskId);
        if (task == null) return false;

        task.IsDeleted = true;
        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsLongRunningAsync(string taskId, int daysThreshold = 60)
    {
        var task = await GetByIdAsync(taskId);
        if (task == null) return false;

        var thresholdDate = DateTime.UtcNow.AddDays(-daysThreshold);
        return task.CreatedDate < thresholdDate && task.Status != Domain.Enums.TaskStatus.Completed;
    }

    public async Task<IReadOnlyList<TaskItem>> GetDelayedTasksAsync(string? userId, int daysThreshold)
    {
        var thresholdDate = DateTime.UtcNow.AddDays(-daysThreshold);
        var query = _context.Tasks.Where(t => !t.IsDeleted && t.CreatedDate < thresholdDate);

        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(t =>
                t.AssigneeID == userId ||
                t.CheckerID == userId ||
                t.ChiefDesignerID == userId ||
                t.ApproverID == userId);
        }

        return await query.ToListAsync();
    }

    public async Task<IReadOnlyList<TaskItem>> GetOverdueTasksAsync(string? userId)
    {
        var today = DateTime.UtcNow.Date;
        var query = _context.Tasks
            .Where(t => !t.IsDeleted && t.DueDate.HasValue && t.DueDate < today && t.Status != Domain.Enums.TaskStatus.Completed);

        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(t =>
                t.AssigneeID == userId ||
                t.CheckerID == userId ||
                t.ChiefDesignerID == userId ||
                t.ApproverID == userId);
        }

        return await query.ToListAsync();
    }
}

