using AutoMapper;
using TaskManageSystem.Application.DTOs.Users;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;
using TaskManageSystem.Infrastructure.Repositories;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 用户服务实现
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResponse<UserDto>> GetUsersAsync(UserQueryParams query)
    {
        var users = await _userRepository.GetAllAsync();

        // 过滤
        if (!string.IsNullOrEmpty(query.OfficeLocation))
        {
            if (Enum.TryParse<OfficeLocation>(query.OfficeLocation, out var location))
                users = users.Where(u => u.OfficeLocation == location);
        }

        if (!string.IsNullOrEmpty(query.Status))
        {
            if (Enum.TryParse<PersonnelStatus>(query.Status, out var status))
                users = users.Where(u => u.Status == status);
        }

        if (!string.IsNullOrEmpty(query.SystemRole))
        {
            if (Enum.TryParse<SystemRole>(query.SystemRole, out var role))
                users = users.Where(u => u.SystemRole == role);
        }

        var total = users.Count();
        var pages = (int)Math.Ceiling(total / (double)query.PageSize);

        users = users.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize);

        return new PaginatedResponse<UserDto>
        {
            Data = _mapper.Map<List<UserDto>>(users),
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize,
            Pages = pages
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        var user = _mapper.Map<User>(request);
        if (!string.IsNullOrEmpty(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }
        user = await _userRepository.CreateAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateUserAsync(string userId, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) throw new KeyNotFoundException($"User {userId} not found");

        _mapper.Map(request, user);
        user = await _userRepository.UpdateAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> SoftDeleteUserAsync(string userId)
    {
        return await _userRepository.SoftDeleteAsync(userId);
    }

    public async Task<bool> RestoreUserAsync(string userId)
    {
        return await _userRepository.RestoreAsync(userId);
    }

    public async Task<UserDto?> ValidateCredentialsAsync(string userId, string password)
    {
        var user = await _userRepository.GetByCredentialsAsync(userId, password);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.PasswordHash)) return false;

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash)) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(string userId, string? newPassword)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword ?? "123456");
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<List<UserDto>> GetTeamMembersAsync(string currentUserId)
    {
        var currentUser = await _userRepository.GetByIdAsync(currentUserId);
        if (currentUser == null) return new List<UserDto>();

        var users = await _userRepository.GetAllAsync();
        // 排除当前用户和admin
        users = users.Where(u => u.UserID != currentUserId && u.UserID != "admin");

        return _mapper.Map<List<UserDto>>(users);
    }
}
