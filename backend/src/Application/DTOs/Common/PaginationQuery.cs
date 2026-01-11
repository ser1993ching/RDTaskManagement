namespace TaskManageSystem.Application.DTOs.Common;

/// <summary>
/// 分页查询参数
/// </summary>
public class PaginationQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public bool IncludeDeleted { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } = "desc";
}
