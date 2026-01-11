using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Users;

namespace TaskManageSystem.Application.Interfaces;

/// <summary>
/// 用户服务接口
/// </summary>
public interface IUserService
{
    Task<PaginatedResponse<UserDto>> GetUsersAsync(UserQueryParams query);
    Task<UserDto?> GetUserByIdAsync(string userId);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<UserDto> UpdateUserAsync(string userId, UpdateUserRequest request);
    Task<bool> SoftDeleteUserAsync(string userId);
    Task<bool> RestoreUserAsync(string userId);
    Task<UserDto?> ValidateCredentialsAsync(string userId, string password);
    Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    Task<bool> ResetPasswordAsync(string userId, string? newPassword);
    Task<List<UserDto>> GetTeamMembersAsync(string currentUserId);
}
