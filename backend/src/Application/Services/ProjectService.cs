using AutoMapper;
using R&DTaskSystem.Application.DTOs.Projects;
using R&DTaskSystem.Application.Interfaces;
using R&DTaskSystem.Domain.Entities;
using R&DTaskSystem.Infrastructure.Repositories;

namespace R&DTaskSystem.Application.Services;

/// <summary>
/// 项目服务实现
/// </summary>
public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IMapper _mapper;

    public ProjectService(IProjectRepository projectRepository, IMapper mapper)
    {
        _projectRepository = projectRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResponse<ProjectDto>> GetProjectsAsync(ProjectQueryParams query)
    {
        var projects = await _projectRepository.GetAllAsync();

        // 过滤
        if (!string.IsNullOrEmpty(query.Category))
        {
            if (Enum.TryParse<ProjectCategory>(query.Category, out var category))
                projects = projects.Where(p => p.Category == category);
        }

        if (query.IsKeyProject.HasValue)
        {
            projects = projects.Where(p => p.IsKeyProject == query.IsKeyProject.Value);
        }

        var total = projects.Count();
        var pages = (int)Math.Ceiling(total / (double)query.PageSize);

        projects = projects.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize);

        return new PaginatedResponse<ProjectDto>
        {
            Data = _mapper.Map<List<ProjectDto>>(projects),
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize,
            Pages = pages
        };
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(string id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        return project == null ? null : _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request)
    {
        var project = _mapper.Map<Project>(request);

        // 生成项目ID
        project.Id = $"P-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";

        project = await _projectRepository.CreateAsync(project);
        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> UpdateProjectAsync(string id, UpdateProjectRequest request)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null) throw new KeyNotFoundException($"Project {id} not found");

        _mapper.Map(request, project);
        project = await _projectRepository.UpdateAsync(project);
        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<bool> SoftDeleteProjectAsync(string id)
    {
        return await _projectRepository.SoftDeleteAsync(id);
    }

    public async Task<bool> IsProjectInUseAsync(string id)
    {
        return await _projectRepository.CountTasksByProjectIdAsync(id) > 0;
    }

    public async Task<ProjectStatisticsResponse> GetStatisticsAsync(string? category)
    {
        ProjectCategory? categoryEnum = null;
        if (!string.IsNullOrEmpty(category) && Enum.TryParse<ProjectCategory>(category, out var cat))
            categoryEnum = cat;

        var (total, byCategory, keyProjects, completed) = await _projectRepository.GetStatisticsAsync(categoryEnum);

        return new ProjectStatisticsResponse
        {
            Total = total,
            ByCategory = byCategory,
            KeyProjects = keyProjects,
            Completed = completed
        };
    }
}
