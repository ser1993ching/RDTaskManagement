using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Domain.Entities;

/// <summary>
/// 系统配置项实体 - 用于存储可配置的选项数据
/// </summary>
public class SystemConfig : BaseEntity<int>
{
    /// <summary>
    /// 主键ID
    /// </summary>
    [Key]
    public override int Id { get; set; }

    /// <summary>
    /// 配置键（如 "EquipmentModels", "CapacityLevels", "TaskCategories_Market"）
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string ConfigKey { get; set; } = string.Empty;

    /// <summary>
    /// 配置类别（如 "EquipmentModels", "CapacityLevels", "TaskCategories"）
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string ConfigCategory { get; set; } = string.Empty;

    /// <summary>
    /// 配置值（JSON格式存储）
    /// </summary>
    [Required]
    public string ConfigValue { get; set; } = string.Empty;

    /// <summary>
    /// 配置描述
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }
}
