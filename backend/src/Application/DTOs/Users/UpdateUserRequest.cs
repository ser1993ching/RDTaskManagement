namespace R&DTaskSystem.Application.DTOs.Users;

/// <summary>
/// 更新用户请求
/// </summary>
public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? SystemRole { get; set; }
    public string? OfficeLocation { get; set; }
    public string? Title { get; set; }
    public DateTime? JoinDate { get; set; }
    public string? Status { get; set; }
    public string? Education { get; set; }
    public string? School { get; set; }
    public string? Remark { get; set; }
}
