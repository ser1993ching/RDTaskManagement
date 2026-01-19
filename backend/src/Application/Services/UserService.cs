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
/// 用户服务实现
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository? _userRepository;
    private readonly IMapper _mapper;

    // 默认用户数据（内存模式）
    private static readonly List<User> DefaultUsers = new()
    {
        new User
        {
            UserID = "admin",
            Name = "系统管理员",
            SystemRole = SystemRole.Admin,
            OfficeLocation = OfficeLocation.Chengdu,
            Status = PersonnelStatus.Active,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
            CreatedAt = new DateTime(2025, 1, 1)
        },
        new User
        {
            UserID = "USER001",
            Name = "李研究员",
            SystemRole = SystemRole.Member,
            OfficeLocation = OfficeLocation.Chengdu,
            Status = PersonnelStatus.Active,
            Title = "工程师",
            JoinDate = new DateTime(2022, 7, 1),
            Education = "硕士",
            School = "四川大学",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
            CreatedAt = new DateTime(2025, 1, 1)
        }
    };

    public UserService(IUserRepository? userRepository = null)
    {
        _userRepository = userRepository;
        // 始终使用自定义的 MapperConfiguration
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
        List<User> users;

        // 尝试从数据库获取，否则使用内存数据
        if (_userRepository != null)
        {
            try
            {
                users = (await _userRepository.GetAllAsync()).ToList();
            }
            catch
            {
                users = DefaultUsers.ToList();
            }
        }
        else
        {
            users = DefaultUsers.ToList();
        }

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
        // 先从默认列表查找 - 确保内存用户始终可用
        var defaultUser = DefaultUsers.FirstOrDefault(u => u.UserID == userId);
        if (defaultUser != null)
        {
            return _mapper.Map<UserDto>(defaultUser);
        }

        // 尝试从数据库查找
        if (_userRepository != null)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                return user == null ? null : _mapper.Map<UserDto>(user);
            }
            catch (Exception ex)
            {
                // 数据库连接失败，返回null
                Console.WriteLine($"数据库连接失败，无法获取用户: {ex.Message}");
                return null;
            }
        }

        return null;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        if (_userRepository == null)
        {
            var user = _mapper.Map<User>(request);
            if (!string.IsNullOrEmpty(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }
            DefaultUsers.Add(user);
            return _mapper.Map<UserDto>(user);
        }

        var dbUser = _mapper.Map<User>(request);
        if (!string.IsNullOrEmpty(request.Password))
        {
            dbUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }
        dbUser = await _userRepository.CreateAsync(dbUser);
        return _mapper.Map<UserDto>(dbUser);
    }

    public async Task<UserDto> UpdateUserAsync(string userId, UpdateUserRequest request)
    {
        var user = await GetUserEntityByIdAsync(userId);
        if (user == null) throw new KeyNotFoundException($"User {userId} not found");

        _mapper.Map(request, user);

        if (_userRepository != null)
        {
            user = await _userRepository.UpdateAsync(user);
        }
        else
        {
            // 更新内存数据
            var index = DefaultUsers.FindIndex(u => u.UserID == userId);
            if (index >= 0) DefaultUsers[index] = user;
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> SoftDeleteUserAsync(string userId)
    {
        if (_userRepository == null)
        {
            var removed = DefaultUsers.RemoveAll(u => u.UserID == userId);
            return removed > 0;
        }

        return await _userRepository.SoftDeleteAsync(userId);
    }

    public async Task<bool> RestoreUserAsync(string userId)
    {
        if (_userRepository == null) return false;
        return await _userRepository.RestoreAsync(userId);
    }

    public async Task<UserDto?> ValidateCredentialsAsync(string userId, string password)
    {
        // 先从默认列表查找 - 确保内存用户始终可用
        var defaultUser = DefaultUsers.FirstOrDefault(u => u.UserID == userId);
        if (defaultUser != null)
        {
            if (BCrypt.Net.BCrypt.Verify(password, defaultUser.PasswordHash))
            {
                return _mapper.Map<UserDto>(defaultUser);
            }
            // 即使密码不匹配，也继续尝试数据库（可能是数据库用户）
        }

        // 尝试从数据库查找
        if (_userRepository != null)
        {
            try
            {
                var user = await _userRepository.GetByCredentialsAsync(userId, password);
                if (user != null)
                {
                    return _mapper.Map<UserDto>(user);
                }
            }
            catch (Exception ex)
            {
                // 数据库连接失败，记录日志并继续使用内存用户
                Console.WriteLine($"数据库连接失败，使用内存用户: {ex.Message}");
            }
        }

        // 如果默认用户存在但密码不匹配，返回null
        if (defaultUser != null)
        {
            return null;
        }

        // 数据库用户不存在于默认列表
        return null;
    }

    public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
    {
        var user = await GetUserEntityByIdAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.PasswordHash)) return false;

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash)) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

        if (_userRepository != null)
        {
            await _userRepository.UpdateAsync(user);
        }
        else
        {
            var index = DefaultUsers.FindIndex(u => u.UserID == userId);
            if (index >= 0) DefaultUsers[index] = user;
        }

        return true;
    }

    public async Task<bool> ResetPasswordAsync(string userId, string? newPassword)
    {
        var user = await GetUserEntityByIdAsync(userId);
        if (user == null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword ?? "123456");

        if (_userRepository != null)
        {
            await _userRepository.UpdateAsync(user);
        }
        else
        {
            var index = DefaultUsers.FindIndex(u => u.UserID == userId);
            if (index >= 0) DefaultUsers[index] = user;
        }

        return true;
    }

    public async Task<List<UserDto>> GetTeamMembersAsync(string currentUserId)
    {
        var currentUser = await GetUserEntityByIdAsync(currentUserId);
        if (currentUser == null) return new List<UserDto>();

        // 排除当前用户和admin
        var users = DefaultUsers.Where(u => u.UserID != currentUserId && u.UserID != "admin").ToList();

        if (_userRepository != null)
        {
            try
            {
                var dbUsers = await _userRepository.GetAllAsync();
                users = dbUsers.Where(u => u.UserID != currentUserId && u.UserID != "admin").ToList();
            }
            catch { }
        }

        return _mapper.Map<List<UserDto>>(users);
    }

    // 辅助方法：获取用户实体
    private async Task<User?> GetUserEntityByIdAsync(string userId)
    {
        var defaultUser = DefaultUsers.FirstOrDefault(u => u.UserID == userId);
        if (defaultUser != null) return defaultUser;

        if (_userRepository == null) return null;

        return await _userRepository.GetByIdAsync(userId);
    }
}
