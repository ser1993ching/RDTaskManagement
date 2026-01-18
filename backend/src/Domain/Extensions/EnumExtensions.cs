using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace TaskManageSystem.Domain.Extensions;

/// <summary>
/// 枚举扩展方法
/// </summary>
public static class EnumExtensions
{
    /// <summary>
    /// 获取枚举的显示名称
    /// </summary>
    public static string GetDisplayName(this Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        if (field == null) return value.ToString();

        var attribute = field.GetCustomAttribute<DisplayAttribute>();
        return attribute?.Name ?? value.ToString();
    }

    /// <summary>
    /// 安全获取枚举的显示名称（处理null情况）
    /// </summary>
    public static string? GetDisplayNameOrNull(this Enum? value)
    {
        if (value == null) return null;
        return GetDisplayName(value);
    }
}
