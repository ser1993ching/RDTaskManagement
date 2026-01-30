namespace TaskManageSystem.Domain.Entities;

/// <summary>
/// 基础实体
/// </summary>
public abstract class BaseEntity<TKey>
{
    public virtual TKey Id { get; set; } = default!;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
