using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Infrastructure.Data;

namespace TaskManageSystem.Infrastructure.Repositories;

/// <summary>
/// 任务类别仓储实现
/// </summary>
public class TaskClassRepository : ITaskClassRepository
{
    private readonly AppDbContext _context;

    public TaskClassRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaskClass?> GetByIdAsync(string id)
    {
        return await _context.TaskClasses.FirstOrDefaultAsync(tc => tc.Id == id && !tc.IsDeleted);
    }

    public async Task<IReadOnlyList<TaskClass>> GetAllAsync()
    {
        return await _context.TaskClasses.Where(tc => !tc.IsDeleted).ToListAsync();
    }

    public async Task<TaskClass> CreateAsync(TaskClass taskClass)
    {
        taskClass.CreatedAt = DateTime.UtcNow;
        _context.TaskClasses.Add(taskClass);
        await _context.SaveChangesAsync();
        return taskClass;
    }

    public async Task<TaskClass> UpdateAsync(TaskClass taskClass)
    {
        taskClass.UpdatedAt = DateTime.UtcNow;
        _context.TaskClasses.Update(taskClass);
        await _context.SaveChangesAsync();
        return taskClass;
    }

    public async Task<bool> SoftDeleteAsync(string id)
    {
        var taskClass = await GetByIdAsync(id);
        if (taskClass == null) return false;

        taskClass.IsDeleted = true;
        taskClass.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> CountTasksByClassIdAsync(string taskClassId)
    {
        return await _context.Tasks.CountAsync(t => t.TaskClassID == taskClassId && !t.IsDeleted);
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _context.TaskClasses.AnyAsync(tc => tc.Id == id && !tc.IsDeleted);
    }
}
