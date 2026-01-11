using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Domain.Entities;

/// <summary>
/// 任务类别实体
/// </summary>
public class TaskClass : BaseEntity<string>
{
    public string Id { get; set; } = string.Empty;    // 类别ID (PK)，如 TC001
    public string Name { get; set; } = string.Empty;
    public TaskClassCode Code { get; set; }           // 类别代码，如 MARKET
    public string? Description { get; set; }
    public string? Notice { get; set; }               // 自定义提示文字

    // 导航属性
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
