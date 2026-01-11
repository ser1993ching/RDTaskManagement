using Microsoft.AspNetCore.Mvc;
using R&DTaskSystem.Application.DTOs.Common;
using R&DTaskSystem.Application.DTOs.Projects;
using R&DTaskSystem.Application.Interfaces;

namespace R&DTaskSystem.Api.Controllers;

/// <summary>
/// 项目管理控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>
    /// 获取项目列表
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<ProjectDto>>>> GetProjects([FromQuery] ProjectQueryParams query)
    {
        var result = await _projectService.GetProjectsAsync(query);
        return Ok(new ApiResponse<PaginatedResponse<ProjectDto>> { Success = true, Data = result });
    }

    /// <summary>
    /// 获取单个项目
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> GetProject(string id)
    {
        var project = await _projectService.GetProjectByIdAsync(id);
        if (project == null)
        {
            return NotFound(new ApiResponse<ProjectDto> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "项目不存在" } });
        }

        return Ok(new ApiResponse<ProjectDto> { Success = true, Data = project });
    }

    /// <summary>
    /// 创建项目
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> CreateProject([FromBody] CreateProjectRequest request)
    {
        var project = await _projectService.CreateProjectAsync(request);
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, new ApiResponse<ProjectDto> { Success = true, Data = project, Message = "创建成功" });
    }

    /// <summary>
    /// 更新项目
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> UpdateProject(string id, [FromBody] UpdateProjectRequest request)
    {
        var project = await _projectService.UpdateProjectAsync(id, request);
        return Ok(new ApiResponse<ProjectDto> { Success = true, Data = project, Message = "更新成功" });
    }

    /// <summary>
    /// 删除项目（软删除）
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteProject(string id)
    {
        var result = await _projectService.SoftDeleteProjectAsync(id);
        return result
            ? Ok(new ApiResponse<object> { Success = true, Message = "删除成功" })
            : NotFound(new ApiResponse<object> { Success = false, Error = new ApiError { Code = "NOT_FOUND", Message = "项目不存在" } });
    }

    /// <summary>
    /// 检查项目使用情况
    /// </summary>
    [HttpGet("{id}/usage")]
    public async Task<ActionResult<ApiResponse<object>>> CheckUsage(string id)
    {
        var inUse = await _projectService.IsProjectInUseAsync(id);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { taskCount = inUse ? 1 : 0, canDelete = !inUse }
        });
    }

    /// <summary>
    /// 获取项目统计
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<ProjectStatisticsResponse>>> GetStatistics([FromQuery] string? category)
    {
        var stats = await _projectService.GetStatisticsAsync(category);
        return Ok(new ApiResponse<ProjectStatisticsResponse> { Success = true, Data = stats });
    }
}
