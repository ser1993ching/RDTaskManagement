using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.Users;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 用户控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "LEADER,ADMIN")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// 获取用户列表
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] UserQueryParams query)
    {
        var result = await _userService.GetUsersAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// 获取单个用户
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUser(string userId)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new
            {
                success = false,
                error = new { code = "NOT_FOUND", message = $"用户 {userId} 不存在" }
            });
        }
        return Ok(new
        {
            success = true,
            data = user,
            message = (string?)null,
            error = (object?)null
        });
    }

    /// <summary>
    /// 创建用户
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = await _userService.CreateUserAsync(request);
        return Ok(user);
    }

    /// <summary>
    /// 更新用户
    /// </summary>
    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserRequest request)
    {
        var user = await _userService.UpdateUserAsync(userId, request);
        return Ok(user);
    }

    /// <summary>
    /// 删除用户
    /// </summary>
    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var result = await _userService.SoftDeleteUserAsync(userId);
        if (!result)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// 恢复用户
    /// </summary>
    [HttpPost("{userId}/restore")]
    public async Task<IActionResult> RestoreUser(string userId)
    {
        var result = await _userService.RestoreUserAsync(userId);
        if (!result)
            return NotFound();
        return Ok(new { Success = true });
    }

    /// <summary>
    /// 获取团队成员
    /// </summary>
    [HttpGet("team/{currentUserId}")]
    public async Task<IActionResult> GetTeamMembers(string currentUserId)
    {
        var members = await _userService.GetTeamMembersAsync(currentUserId);
        return Ok(members);
    }
}
