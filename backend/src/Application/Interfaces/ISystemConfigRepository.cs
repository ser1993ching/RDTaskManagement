using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.Interfaces;

/// <summary>
/// 系统配置仓储接口
/// </summary>
public interface ISystemConfigRepository
{
    /// <summary>
    /// 获取配置值
    /// </summary>
    Task<string?> GetConfigValueAsync(string category, string key);

    /// <summary>
    /// 保存配置值
    /// </summary>
    Task SaveConfigValueAsync(string category, string key, string value);

    /// <summary>
    /// 检查配置是否存在
    /// </summary>
    Task<bool> ConfigExistsAsync(string category, string key);

    /// <summary>
    /// 获取所有配置（按类别）
    /// </summary>
    Task<List<SystemConfig>> GetConfigsByCategoryAsync(string category);
}
