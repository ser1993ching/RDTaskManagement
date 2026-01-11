using TaskManageSystem.Application.DTOs.Common;

namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 任务查询参数
/// </summary>
public class TaskQueryParams : PaginationQuery
{
    public string? Status { get; set; }
    public string? TaskClassID { get; set; }
    public string? Category { get; set; }
    public string? ProjectID { get; set; }
    public string? AssigneeID { get; set; }
    public string? CheckerID { get; set; }
    public string? ApproverID { get; set; }
    public DateTime? StartDateFrom { get; set; }
    public DateTime? StartDateTo { get; set; }
    public DateTime? DueDateFrom { get; set; }
    public DateTime? DueDateTo { get; set; }
    public string? UserId { get; set; }
    public string? Period { get; set; }
}
