namespace TaskManageSystem.Domain.Entities;

/// <summary>
/// 用户实体
/// </summary>
public class User : BaseEntity<string>
{
    public string UserID { get; set; } = string.Empty;  // 工号 (PK)
    public string Name { get; set; } = string.Empty;
    public SystemRole SystemRole { get; set; }
    public OfficeLocation OfficeLocation { get; set; }
    public string? Title { get; set; }                   // 职称
    public DateTime? JoinDate { get; set; }              // 参加工作时间
    public PersonnelStatus Status { get; set; }
    public string? Education { get; set; }
    public string? School { get; set; }
    public string? PasswordHash { get; set; }            // 密码哈希
    public string? Remark { get; set; }

    // 导航属�?
    public virtual ICollection<Task> CreatedTasks { get; set; } = new List<Task>();
    public virtual ICollection<Task> AssignedTasks { get; set; } = new List<Task>();
    public virtual ICollection<Task> CheckerTasks { get; set; } = new List<Task>();
    public virtual ICollection<Task> ChiefDesignerTasks { get; set; } = new List<Task>();
    public virtual ICollection<Task> ApproverTasks { get; set; } = new List<Task>();
    public virtual ICollection<TaskPoolItem> CreatedPoolItems { get; set; } = new List<TaskPoolItem>();
}
