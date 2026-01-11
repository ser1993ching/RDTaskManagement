namespace R&DTaskSystem.Application.DTOs.Users;

/// <summary>
/// 用户查询参数
/// </summary>
public class UserQueryParams : PaginationQuery
{
    public string? OfficeLocation { get; set; }
    public string? Status { get; set; }
    public string? SystemRole { get; set; }
}
