using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Infrastructure.Data;

namespace TaskManageSystem.Infrastructure.Repositories;

/// <summary>
/// 系统配置仓储实现
/// </summary>
public class SystemConfigRepository : ISystemConfigRepository
{
    private readonly AppDbContext _context;

    public SystemConfigRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<string?> GetConfigValueAsync(string category, string key)
    {
        var config = await _context.SystemConfigs
            .FirstOrDefaultAsync(c => c.ConfigCategory == category && c.ConfigKey == key);

        return config?.ConfigValue;
    }

    public async Task SaveConfigValueAsync(string category, string key, string value)
    {
        var config = await _context.SystemConfigs
            .FirstOrDefaultAsync(c => c.ConfigCategory == category && c.ConfigKey == key);

        if (config != null)
        {
            config.ConfigValue = value;
            config.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _context.SystemConfigs.Add(new SystemConfig
            {
                ConfigKey = key,
                ConfigCategory = category,
                ConfigValue = value,
                Description = category,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task<bool> ConfigExistsAsync(string category, string key)
    {
        return await _context.SystemConfigs
            .AnyAsync(c => c.ConfigCategory == category && c.ConfigKey == key);
    }

    public async Task<List<SystemConfig>> GetConfigsByCategoryAsync(string category)
    {
        return await _context.SystemConfigs
            .Where(c => c.ConfigCategory == category)
            .ToListAsync();
    }
}
