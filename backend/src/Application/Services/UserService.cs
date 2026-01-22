using AutoMapper;
using BCrypt.Net;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Users;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Repositories;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 用户服务实现 - 仅使用数据库用户
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
        var config = new MapperConfiguration(cfg => {
            cfg.CreateMap<User, UserDto>()
                .ForMember(dest => dest.SystemRole, opt => opt.MapFrom(src => src.SystemRole.ToString()))
                .ForMember(dest => dest.OfficeLocation, opt => opt.MapFrom(src => src.OfficeLocation.ToString()))
                .ForMember(dest => dest.JoinDate, opt => opt.MapFrom(src => src.JoinDate.HasValue ? src.JoinDate.Value.ToString("yyyy-MM-dd") : ""))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            cfg.CreateMap<CreateUserRequest, User>();
            cfg.CreateMap<UpdateUserRequest, User>();
        });
        _mapper = config.CreateMapper();
    }

    public async Task<PaginatedResponse<UserDto>> GetUsersAsync(UserQueryParams query)
    {
        var users = (await _userRepository.GetAllAsync()).ToList();

        // 过滤
        if (!string.IsNullOrEmpty(query.OfficeLocation))
        {
            if (Enum.TryParse<OfficeLocation>(query.OfficeLocation, out var location))
                users = users.Where(u => u.OfficeLocation == location).ToList();
        }

        if (!string.IsNullOrEmpty(query.Status))
        {
            if (Enum.TryParse<PersonnelStatus>(query.Status, out var status))
                users = users.Where(u => u.Status == status).ToList();
        }

        if (!string.IsNullOrEmpty(query.SystemRole))
        {
            if (Enum.TryParse<SystemRole>(query.SystemRole, out var role))
                users = users.Where(u => u.SystemRole == role).ToList();
        }

        var total = users.Count;
        var pages = (int)Math.Ceiling(total / (double)query.PageSize);

        users = users.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToList();

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
        else
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123");
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
        if (user != null)
        {
            return _mapper.Map<UserDto>(user);
        }
        return null;
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

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword ?? "123");
        await _userRepository.UpdateAsync(user);

        return true;
    }

    public async Task<List<UserDto>> GetTeamMembersAsync(string currentUserId)
    {
        var dbUsers = await _userRepository.GetAllAsync();
        var users = dbUsers.Where(u => u.UserID != currentUserId && u.UserID != "admin").ToList();

        return _mapper.Map<List<UserDto>>(users);
    }
}
