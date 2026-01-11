using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Infrastructure.Data;

namespace TaskManageSystem.Infrastructure.Repositories;

/// <summary>
/// 项目仓储实现
/// </summary>
public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Project?> GetByIdAsync(string id)
    {
        return await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
    }

    public async Task<Project?> GetByIdNoTrackingAsync(string id)
    {
        return await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IReadOnlyList<Project>> GetAllAsync()
    {
        return await _context.Projects.Where(p => !p.IsDeleted).OrderByDescending(p => p.StartDate).ToListAsync();
    }

    public async Task<IReadOnlyList<Project>> GetByCategoryAsync(Domain.Enums.ProjectCategory category)
    {
        return await _context.Projects.Where(p => p.Category == category && !p.IsDeleted).ToListAsync();
    }

    public async Task<Project> CreateAsync(Project project)
    {
        project.CreatedAt = DateTime.UtcNow;
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return project;
    }

    public async Task<Project> UpdateAsync(Project project)
    {
        project.UpdatedAt = DateTime.UtcNow;
        _context.Projects.Update(project);
        await _context.SaveChangesAsync();
        return project;
    }

    public async Task<bool> SoftDeleteAsync(string id)
    {
        var project = await GetByIdAsync(id);
        if (project == null) return false;

        project.IsDeleted = true;
        project.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> CountTasksByProjectIdAsync(string projectId)
    {
        return await _context.Tasks.CountAsync(t => t.ProjectID == projectId && !t.IsDeleted);
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _context.Projects.AnyAsync(p => p.Id == id && !p.IsDeleted);
    }

    public async Task<(int Total, Dictionary<string, int> ByCategory, int KeyProjects, int Completed)> GetStatisticsAsync(Domain.Enums.ProjectCategory? category)
    {
        var query = _context.Projects.Where(p => !p.IsDeleted);

        if (category.HasValue)
        {
            query = query.Where(p => p.Category == category.Value);
        }

        var total = await query.CountAsync();
        var keyProjects = await query.CountAsync(p => p.IsKeyProject);
        var completed = await query.CountAsync(p => p.IsCompleted);

        var byCategory = await query
            .GroupBy(p => p.Category.ToString())
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        return (total, byCategory, keyProjects, completed);
    }
}
