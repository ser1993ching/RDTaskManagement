using Microsoft.AspNetCore.Mvc;
using R&DTaskSystem.Application.DTOs.Common;
using R&DTaskSystem.Application.DTOs.Settings;
using R&DTaskSystem.Application.Interfaces;
using R&DTaskSystem.Domain.Entities;

namespace R&DTaskSystem.Api.Controllers;

/// <summary>
/// 认证控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// 登录
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var user = await _userService.ValidateCredentialsAsync(request.UserId, request.Password);

        if (user == null)
        {
            return Ok(new ApiResponse<LoginResponse>
            {
                Success = false,
                Error = new ApiError { Code = "INVALID_CREDENTIALS", Message = "用户名或密码错误" }
            });
        }

        return Ok(new ApiResponse<LoginResponse>
        {
            Success = true,
            Data = new LoginResponse
            {
                Success = true,
                User = user,
                Token = "jwt-token-placeholder",  // 实际项目中应生成JWT Token
                Message = "登录成功"
            }
        });
    }

    /// <summary>
    /// 获取当前用户
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
    {
        // 从Token或Session获取当前用户ID
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new ApiResponse<UserDto> { Success = true, Data = user });
    }

    /// <summary>
    /// 修改密码
    /// </summary>
    [HttpPut("password")]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var result = await _userService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);

        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "密码修改成功" })
            : BadRequest(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "PASSWORD_MISMATCH", Message = "当前密码错误" } });
    }

    /// <summary>
    /// 重置密码（管理员）
    /// </summary>
    [HttpPut("reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _userService.ResetPasswordAsync(request.UserId, request.NewPassword);

        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "密码重置成功" })
            : BadRequest(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "USER_NOT_FOUND", Message = "用户不存在" } });
    }
}
