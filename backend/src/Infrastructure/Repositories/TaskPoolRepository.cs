using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Infrastructure.Data;
using TaskManageSystem.Application.Repositories;

namespace TaskManageSystem.Infrastructure.Repositories;

/// <summary>
/// 任务库仓储实现�?
/// </summary>
public class TaskPoolRepository : ITaskPoolRepository
{
    private readonly AppDbContext _context;

    public TaskPoolRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaskPoolItem?> GetByIdAsync(string id)
    {
        return await _context.TaskPoolItems.FirstOrDefaultAsync(tp => tp.Id == id && !tp.IsDeleted);
    }

    public async Task<TaskPoolItem?> GetByIdNoTrackingAsync(string id)
    {
        return await _context.TaskPoolItems.AsNoTracking().FirstOrDefaultAsync(tp => tp.Id == id);
    }

    public async Task<IReadOnlyList<TaskPoolItem>> GetAllAsync()
    {
        return await _context.TaskPoolItems.Where(tp => !tp.IsDeleted).OrderByDescending(tp => tp.CreatedDate).ToListAsync();
    }

    public async Task<TaskPoolItem> CreateAsync(TaskPoolItem item)
    {
        item.CreatedDate = DateTime.UtcNow;
        item.CreatedAt = DateTime.UtcNow;
        _context.TaskPoolItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<TaskPoolItem> UpdateAsync(TaskPoolItem item)
    {
        item.UpdatedAt = DateTime.UtcNow;
        _context.TaskPoolItems.Update(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> SoftDeleteAsync(string id)
    {
        var item = await GetByIdAsync(id);
        if (item == null) return false;

        item.IsDeleted = true;
        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<(int Total, Dictionary<string, int> ByCategory, Dictionary<string, int> ByProject, int Pending, int Assigned)> GetStatisticsAsync()
    {
        var items = await _context.TaskPoolItems.Where(tp => !tp.IsDeleted).ToListAsync();

        var total = items.Count;
        var byCategory = items.GroupBy(tp => tp.TaskClassID).ToDictionary(g => g.Key, g => g.Count());
        var byProject = items.Where(tp => !string.IsNullOrEmpty(tp.ProjectID)).GroupBy(tp => tp.ProjectID!).ToDictionary(g => g.Key, g => g.Count());
        var pending = items.Count(tp => string.IsNullOrEmpty(tp.PersonInChargeID));
        var assigned = items.Count(tp => !string.IsNullOrEmpty(tp.PersonInChargeID));

        return (total, byCategory, byProject, pending, assigned);
    }
}
