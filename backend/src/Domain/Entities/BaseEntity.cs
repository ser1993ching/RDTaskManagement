namespace TaskManageSystem.Domain.Entities;

/// <summary>
/// 基础实体�?
/// </summary>
public abstract class BaseEntity<TKey>
{
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
