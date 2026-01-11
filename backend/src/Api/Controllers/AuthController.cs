using Microsoft.AspNetCore.Mvc;
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

    public AuthController(IUserService userService)
    {
        _userService = userService;
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

        return Ok(new ApiResponse<LoginResponse>
        {
            Success = true,
            Data = new LoginResponse
            {
                Success = true,
                User = user,
                Token = "mock-jwt-token"
            }
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
}
