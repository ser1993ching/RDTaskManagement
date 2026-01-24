using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManageSystem.Domain.Entities;

/// <summary>
/// 任务实体
/// </summary>
public class TaskItem : BaseEntity<string>
{
    public string TaskID { get; set; } = string.Empty;  // 任务ID (PK)
    public string TaskName { get; set; } = string.Empty;
    public string TaskClassID { get; set; }             // 关联任务类别ID
    public string Category { get; set; }                // 二级分类
    public string? ProjectID { get; set; }              // 关联项目ID
    public string? AssigneeID { get; set; }             // 负责人ID
    public string? AssigneeName { get; set; }           // 负责人姓名（非系统用户）
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public Enums.TaskStatus Status { get; set; }
    public decimal? Workload { get; set; }              // 预估工作量（小时）
    public decimal? Difficulty { get; set; }            // 难度系数（0.5-3.0）
    public string? Remark { get; set; }
    public DateTime CreatedDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    // 差旅任务字段 (TC009)
    public string? TravelLocation { get; set; }         // 出差地点
    public decimal? TravelDuration { get; set; }        // 出差天数
    public string? TravelLabel { get; set; }            // 差旅标签

    // 会议任务字段 (TC007)
    public decimal? MeetingDuration { get; set; }       // 会议时长（小时）
    public string? Participants { get; set; }           // JSON: 参会人员ID列表
    public string? ParticipantNames { get; set; }       // JSON: 参会人员姓名列表

    // 市场任务字段
    public string? RelatedProject { get; set; }           // 关联项目名称
    public bool IsIndependentBusinessUnit { get; set; }   // 是否支持独立经营体

    // 校核人（Checker）
    public string? CheckerID { get; set; }
    public string? CheckerName { get; set; }
    public decimal? CheckerWorkload { get; set; }
    public Enums.RoleStatus? CheckerStatus { get; set; }

    // 主任设计（ChiefDesigner）
    public string? ChiefDesignerID { get; set; }
    public string? ChiefDesignerName { get; set; }
    public decimal? ChiefDesignerWorkload { get; set; }
    public Enums.RoleStatus? ChiefDesignerStatus { get; set; }

    // 审查人（Approver）
    public string? ApproverID { get; set; }
    public string? ApproverName { get; set; }
    public decimal? ApproverWorkload { get; set; }
    public Enums.RoleStatus? ApproverStatus { get; set; }

    // 负责人状态
    public Enums.RoleStatus? AssigneeStatus { get; set; }

    // 其他字段
    public bool IsForceAssessment { get; set; }        // 是否强制考核
    public bool IsInPool { get; set; }                 // 是否在任务库中

    // 导航属性（不使用EF Core关系，仅用于API返回）
    [NotMapped]
    public virtual User? Assignee { get; set; }

    [NotMapped]
    public virtual User? Checker { get; set; }

    [NotMapped]
    public virtual User? ChiefDesigner { get; set; }

    [NotMapped]
    public virtual User? Approver { get; set; }

    [NotMapped]
    public virtual User? Creator { get; set; }

    [NotMapped]
    public virtual Project? Project { get; set; }

    [NotMapped]
    public virtual TaskClass? TaskClass { get; set; }
}
