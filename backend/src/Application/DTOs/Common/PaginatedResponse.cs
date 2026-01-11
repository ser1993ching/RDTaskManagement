namespace R&DTaskSystem.Application.DTOs.Common;

/// <summary>
/// 分页响应
/// </summary>
public class PaginatedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int Pages { get; set; }
}
