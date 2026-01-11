namespace R&DTaskSystem.Domain.Entities;

/// <summary>
/// 基础实体类
/// </summary>
public abstract class BaseEntity<TKey>
{
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
