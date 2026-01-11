namespace R&DTaskSystem.Domain.Entities;

/// <summary>
/// 项目实体
/// </summary>
public class Project : BaseEntity<string>
{
    public string Id { get; set; } = string.Empty;  // 项目ID (PK)
    public string Name { get; set; } = string.Empty;
    public ProjectCategory Category { get; set; }
    public string? WorkNo { get; set; }             // 工作号
    public string? Capacity { get; set; }           // 容量等级
    public string? Model { get; set; }              // 机型
    public bool IsWon { get; set; }                 // 是否中标（市场配合项目）
    public bool IsForeign { get; set; }             // 是否外贸（市场配合项目）
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }          // 截止/首台投运日期
    public bool IsCommissioned { get; set; }        // 是否已投运（常规/核电项目）
    public bool IsCompleted { get; set; }           // 是否已完成（科研/改造/其他）
    public bool IsKeyProject { get; set; }          // 是否重点项目
    public string? Remark { get; set; }

    // 导航属性
    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    public virtual ICollection<TaskPoolItem> PoolItems { get; set; } = new List<TaskPoolItem>();
}
