using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Domain.Enums;

/// <summary>
/// 性别枚举
/// </summary>
public enum Gender
{
    [Display(Name = "男")]
    Male = 0,

    [Display(Name = "女")]
    Female = 1
}

/// <summary>
/// 性别值类型（使用中文值，便于直接解析）
/// </summary>
public static class GenderValues
{
    public const string Male = "男";
    public const string Female = "女";
}
