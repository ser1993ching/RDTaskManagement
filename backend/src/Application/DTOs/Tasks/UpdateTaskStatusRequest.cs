namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 更新任务状态请求
/// </summary>
public class UpdateTaskStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
