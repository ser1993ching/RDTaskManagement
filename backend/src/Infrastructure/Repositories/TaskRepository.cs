using Microsoft.EntityFrameworkCore;
using R&DTaskSystem.Domain.Entities;
using R&DTaskSystem.Infrastructure.Data;

namespace R&DTaskSystem.Infrastructure.Repositories;

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

    public async Task<TaskEntity?> GetByIdAsync(string taskId)
    {
        return await _context.Tasks.FirstOrDefaultAsync(t => t.TaskID == taskId && !t.IsDeleted);
    }

    public async Task<TaskEntity?> GetByIdNoTrackingAsync(string taskId)
    {
        return await _context.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.TaskID == taskId);
    }

    public async Task<IReadOnlyList<TaskEntity>> GetAllAsync()
    {
        return await _context.Tasks.Where(t => !t.IsDeleted).OrderByDescending(t => t.CreatedDate).ToListAsync();
    }

    public async Task<IReadOnlyList<TaskEntity>> GetByAssigneeAsync(string assigneeId)
    {
        return await _context.Tasks.Where(t => t.AssigneeID == assigneeId && !t.IsDeleted).ToListAsync();
    }

    public async Task<IReadOnlyList<TaskEntity>> GetByProjectAsync(string projectId)
    {
        return await _context.Tasks.Where(t => t.ProjectID == projectId && !t.IsDeleted).ToListAsync();
    }

    public async Task<IReadOnlyList<TaskEntity>> GetByTaskClassAsync(string taskClassId)
    {
        return await _context.Tasks.Where(t => t.TaskClassID == taskClassId && !t.IsDeleted).ToListAsync();
    }

    public async Task<IReadOnlyList<TaskEntity>> GetRelatedToUserAsync(string userId)
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

    public async Task<IReadOnlyList<TaskEntity>> GetPersonalTasksAsync(string userId, string? status)
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

    public async Task<IReadOnlyList<TaskEntity>> GetTravelTasksAsync(string userId, string? period)
    {
        var query = _context.Tasks
            .Where(t => t.TaskClassID == "TC009" && !t.IsDeleted && (
                t.AssigneeID == userId ||
                t.CheckerID == userId ||
                t.ChiefDesignerID == userId ||
                t.ApproverID == userId));

        return await query.ToListAsync();
    }

    public async Task<IReadOnlyList<TaskEntity>> GetMeetingTasksAsync(string userId, string? period)
    {
        var query = _context.Tasks
            .Where(t => t.TaskClassID == "TC007" && !t.IsDeleted);

        return await query.ToListAsync();
    }

    public async Task<TaskEntity> CreateAsync(TaskEntity task)
    {
        task.CreatedDate = DateTime.UtcNow;
        task.CreatedAt = DateTime.UtcNow;
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<TaskEntity> UpdateAsync(TaskEntity task)
    {
        task.UpdatedAt = DateTime.UtcNow;
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

    public async Task<IReadOnlyList<TaskEntity>> GetDelayedTasksAsync(string? userId, int daysThreshold)
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

    public async Task<IReadOnlyList<TaskEntity>> GetOverdueTasksAsync(string? userId)
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
