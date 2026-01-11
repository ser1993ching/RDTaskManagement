using Microsoft.AspNetCore.Mvc;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Users;
using TaskManageSystem.Application.Interfaces;

namespace TaskManageSystem.Api.Controllers;

/// <summary>
/// 用户管理控制�?
/// </summary>
[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<ApiResponse<PaginatedResponse<UserDto>>>> GetUsers([FromQuery] UserQueryParams query)
    {
        var result = await _userService.GetUsersAsync(query);
        return Ok(new ApiResponse<PaginatedResponse<UserDto>> { Success = true, Data = result });
    }

    /// <summary>
    /// 获取单个用户
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUser(string userId)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new ApiResponse<UserDto> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "用户不存�? } });
        }

        return Ok(new ApiResponse<UserDto> { Success = true, Data = user });
    }

    /// <summary>
    /// 创建用户
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = await _userService.CreateUserAsync(request);
        return CreatedAtAction(nameof(GetUser), new { userId = user.UserID }, new ApiResponse<UserDto> { Success = true, Data = user, Message = "创建成功" });
    }

    /// <summary>
    /// 更新用户
    /// </summary>
    [HttpPut("{userId}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(string userId, [FromBody] UpdateUserRequest request)
    {
        var user = await _userService.UpdateUserAsync(userId, request);
        return Ok(new ApiResponse<UserDto> { Success = true, Data = user, Message = "更新成功" });
    }

    /// <summary>
    /// 删除用户（软删除�?
    /// </summary>
    [HttpDelete("{userId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteUser(string userId)
    {
        var result = await _userService.SoftDeleteUserAsync(userId);
        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "删除成功" })
            : NotFound(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "用户不存�? } });
    }

    /// <summary>
    /// 恢复用户
    /// </summary>
    [HttpPost("{userId}/restore")]
    public async Task<ActionResult<ApiResponse<object>>> RestoreUser(string userId)
    {
        var result = await _userService.RestoreUserAsync(userId);
        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "恢复成功" })
            : NotFound(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "用户不存�? } });
    }

    /// <summary>
    /// 获取团队成员
    /// </summary>
    [HttpGet("team-members")]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetTeamMembers()
    {
        var currentUserId = User.FindFirst("sub")?.Value;
        var members = await _userService.GetTeamMembersAsync(currentUserId ?? string.Empty);
        return Ok(new ApiResponse<List<UserDto>> { Success = true, Data = members });
    }
}
