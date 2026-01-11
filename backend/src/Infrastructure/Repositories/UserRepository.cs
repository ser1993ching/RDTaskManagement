using Microsoft.EntityFrameworkCore;
using R&DTaskSystem.Domain.Entities;
using R&DTaskSystem.Infrastructure.Data;

namespace R&DTaskSystem.Infrastructure.Repositories;

/// <summary>
/// 用户仓储实现
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(string userId)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId && !u.IsDeleted);
    }

    public async Task<User?> GetByIdNoTrackingAsync(string userId)
    {
        return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserID == userId);
    }

    public async Task<IReadOnlyList<User>> GetAllAsync()
    {
        return await _context.Users.Where(u => !u.IsDeleted).ToListAsync();
    }

    public async Task<IReadOnlyList<User>> GetByRoleAsync(Domain.Enums.SystemRole role)
    {
        return await _context.Users.Where(u => u.SystemRole == role && !u.IsDeleted).ToListAsync();
    }

    public async Task<IReadOnlyList<User>> GetByOfficeLocationAsync(Domain.Enums.OfficeLocation location)
    {
        return await _context.Users.Where(u => u.OfficeLocation == location && !u.IsDeleted).ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        user.CreatedAt = DateTime.UtcNow;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> SoftDeleteAsync(string userId)
    {
        var user = await GetByIdAsync(userId);
        if (user == null) return false;

        user.IsDeleted = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAsync(string userId)
    {
        var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.UserID == userId);
        if (user == null) return false;

        user.IsDeleted = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<User?> GetByCredentialsAsync(string userId, string password)
    {
        var user = await GetByIdAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            return null;

        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash) ? user : null;
    }

    public async Task<bool> ExistsAsync(string userId)
    {
        return await _context.Users.AnyAsync(u => u.UserID == userId && !u.IsDeleted);
    }
}
