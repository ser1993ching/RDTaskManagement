using R&DTaskSystem.Domain.Entities;

namespace R&DTaskSystem.Infrastructure.Repositories;

/// <summary>
/// 用户仓储接口
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(string userId);
    Task<User?> GetByIdNoTrackingAsync(string userId);
    Task<IReadOnlyList<User>> GetAllAsync();
    Task<IReadOnlyList<User>> GetByRoleAsync(Domain.Enums.SystemRole role);
    Task<IReadOnlyList<User>> GetByOfficeLocationAsync(Domain.Enums.OfficeLocation location);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> SoftDeleteAsync(string userId);
    Task<bool> RestoreAsync(string userId);
    Task<User?> GetByCredentialsAsync(string userId, string password);
    Task<bool> ExistsAsync(string userId);
}
