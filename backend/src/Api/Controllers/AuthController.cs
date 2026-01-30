using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskManageSystem.Api.Models;
using TaskManageSystem.Application.DTOs.Settings;
using TaskManageSystem.Application.DTOs.Users;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 认证控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;

    public AuthController(IUserService userService, IConfiguration configuration)
    {
        _userService = userService;
        _configuration = configuration;
    }

    /// <summary>
    /// 用户登录
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userService.ValidateCredentialsAsync(request.UserId, request.Password);
        if (user == null)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Error = new ApiError { Code = "AUTH_FAILED", Message = "用户名或密码错误" }
            });
        }

        var token = GenerateJwtToken(user);

        return Ok(new ApiResponse<LoginResponse>
        {
            Success = true,
            Data = new LoginResponse
            {
                User = user,
                Token = token
            }
        });
    }

    /// <summary>
    /// 刷新Token
    /// </summary>
    [HttpPost("refresh-token")]
    [Authorize]
    public IActionResult RefreshToken()
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("UserID")?.Value;

        if (string.IsNullOrEmpty(currentUserId))
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Error = new ApiError { Code = "INVALID_TOKEN", Message = "无法获取当前用户信息" }
            });
        }

        var user = _userService.GetUserByIdAsync(currentUserId).Result;
        if (user == null)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Error = new ApiError { Code = "USER_NOT_FOUND", Message = "用户不存在" }
            });
        }

        var token = GenerateJwtToken(user);

        return Ok(new ApiResponse<TokenResponse>
        {
            Success = true,
            Data = new TokenResponse { Token = token }
        });
    }

    /// <summary>
    /// 获取当前用户信息
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("UserID")?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Error = new ApiError { Code = "INVALID_TOKEN", Message = "无效的Token" }
            });
        }

        var user = _userService.GetUserByIdAsync(userId).Result;
        if (user == null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Error = new ApiError { Code = "USER_NOT_FOUND", Message = "用户不存在" }
            });
        }

        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Data = user
        });
    }

    /// <summary>
    /// 修改密码
    /// </summary>
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var result = await _userService.ChangePasswordAsync(request.UserId, request.CurrentPassword, request.NewPassword);
        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "密码修改成功" })
            : BadRequest(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "PASSWORD_CHANGE_FAILED", Message = "密码修改失败" } });
    }

    /// <summary>
    /// 重置密码
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _userService.ResetPasswordAsync(request.UserId, request.NewPassword);
        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "密码重置成功" })
            : BadRequest(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "USER_NOT_FOUND", Message = "用户不存在" } });
    }

    /// <summary>
    /// 初始化系统（创建管理员用户）- 仅在无用户时可用
    /// </summary>
    [HttpPost("setup")]
    [AllowAnonymous]
    public async Task<IActionResult> Setup([FromBody] SetupRequest request)
    {
        // 检查是否已有用户
        var existingUsers = await _userService.GetUsersAsync(new UserQueryParams { PageSize = 1 });
        if (existingUsers.Data.Any())
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Error = new ApiError { Code = "ALREADY_SETUP", Message = "系统已初始化，不能再创建初始用户" }
            });
        }

        // 创建管理员用户
        var createRequest = new CreateUserRequest
        {
            UserId = request.AdminUserId,
            Name = request.AdminName,
            Password = request.AdminPassword,
            SystemRole = "ADMIN",
            OfficeLocation = "HEADQUARTERS",
            Status = "ACTIVE"
        };

        try
        {
            var user = await _userService.CreateUserAsync(createRequest);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "管理员用户创建成功",
                Data = new { userId = user.UserId, name = user.Name }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Error = new ApiError { Code = "CREATE_FAILED", Message = $"创建用户失败: {ex.Message}" }
            });
        }
    }

    private string GenerateJwtToken(UserDto user)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "YourSecretKeyHere12345678901234567890";
        var issuer = _configuration["Jwt:Issuer"] ?? "R&DTaskSystem";
        var audience = _configuration["Jwt:Audience"] ?? "R&DTaskSystemClient";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.SystemRole.ToString().ToUpperInvariant()),
            new Claim("userId", user.UserId),
            new Claim("OfficeLocation", user.OfficeLocation.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
