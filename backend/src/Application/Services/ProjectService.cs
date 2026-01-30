using AutoMapper;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Projects;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Repositories;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 项目服务实现
/// </summary>
public class ProjectService : IProjectService
{
    private readonly IProjectRepository? _projectRepository;
    private readonly IMapper _mapper;
    private static readonly List<Project> DefaultProjects = new()
    {
        new Project
        {
            Id = "PRJ001",
            Name = "某水电站机电设计",
            Category = ProjectCategory.Execution,
            WorkNo = "WD-2024-001",
            StartDate = new DateTime(2024, 1, 15),
            EndDate = new DateTime(2024, 12, 31),
            IsCompleted = false,
            IsKeyProject = true,
            IsDeleted = false
        },
        new Project
        {
            Id = "PRJ002",
            Name = "核电项目技术支持",
            Category = ProjectCategory.Nuclear,
            WorkNo = "ND-2024-001",
            Capacity = "700MW",
            Model = "H1000",
            StartDate = new DateTime(2024, 3, 1),
            EndDate = new DateTime(2025, 6, 30),
            IsCompleted = false,
            IsKeyProject = true,
            IsDeleted = false
        }
    };

    public ProjectService(IProjectRepository? projectRepository = null, IMapper? mapper = null)
    {
        _projectRepository = projectRepository;
        _mapper = mapper ?? new MapperConfiguration(cfg => {
            cfg.CreateMap<Project, ProjectDto>();
            cfg.CreateMap<CreateProjectRequest, Project>();
            cfg.CreateMap<UpdateProjectRequest, Project>();
        }).CreateMapper();
    }

    public async Task<PaginatedResponse<ProjectDto>> GetProjectsAsync(ProjectQueryParams query)
    {
        List<Project> projects;

        if (_projectRepository != null)
        {
            try
            {
                projects = (await _projectRepository.GetAllAsync()).ToList();
            }
            catch
            {
                projects = DefaultProjects.ToList();
            }
        }
        else
        {
            projects = DefaultProjects.ToList();
        }

        // 过滤
        if (!string.IsNullOrEmpty(query.Category))
        {
            if (Enum.TryParse<ProjectCategory>(query.Category, out var category))
                projects = projects.Where(p => p.Category == category).ToList();
        }

        if (query.IsKeyProject.HasValue)
        {
            projects = projects.Where(p => p.IsKeyProject == query.IsKeyProject.Value).ToList();
        }

        var total = projects.Count;
        var pages = (int)Math.Ceiling(total / (double)query.PageSize);

        projects = projects.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToList();

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
        var defaultProject = DefaultProjects.FirstOrDefault(p => p.Id == id);
        if (defaultProject != null) return _mapper.Map<ProjectDto>(defaultProject);

        if (_projectRepository == null) return null;

        var project = await _projectRepository.GetByIdAsync(id);
        return project == null ? null : _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request)
    {
        var project = new Project();

        // 手动处理 Category 枚举转换
        if (!string.IsNullOrEmpty(request.Category))
        {
            if (Enum.TryParse<ProjectCategory>(request.Category, out var category))
                project.Category = category;
            else
                project.Category = ProjectCategory.Execution;
        }
        else
        {
            project.Category = ProjectCategory.Execution;
        }

        // 设置其他属性
        project.Name = request.Name;
        project.WorkNo = request.WorkNo;
        project.Capacity = request.Capacity;
        project.Model = request.Model;
        project.StartDate = request.StartDate;
        project.EndDate = request.EndDate;
        project.Remark = request.Remark;
        project.IsKeyProject = request.IsKeyProject;
        project.IsWon = request.IsWon;
        project.IsForeign = request.IsForeign;
        project.IsCommissioned = request.IsCommissioned;
        project.IsCompleted = request.IsCompleted;

        if (_projectRepository == null)
        {
            project.Id = $"PRJ{(DefaultProjects.Count + 1):D3}";
            DefaultProjects.Add(project);
            return _mapper.Map<ProjectDto>(project);
        }

        // 手动分配ID，确保与数据库中的种子数据不冲突
        var maxId = await _projectRepository.GetMaxProjectIdAsync();
        var counter = 1;
        if (!string.IsNullOrEmpty(maxId) && maxId.StartsWith("PRJ"))
        {
            var numPart = maxId.Substring(3);
            if (int.TryParse(numPart, out var num))
            {
                counter = num + 1;
            }
        }
        project.Id = $"PRJ{counter:D3}";
        project = await _projectRepository.CreateAsync(project);
        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> UpdateProjectAsync(string id, UpdateProjectRequest request)
    {
        var project = await GetProjectEntityByIdAsync(id);
        if (project == null) throw new KeyNotFoundException($"Project {id} not found");

        // 手动处理 Category 枚举转换
        if (!string.IsNullOrEmpty(request.Category))
        {
            if (Enum.TryParse<ProjectCategory>(request.Category, out var category))
                project.Category = category;
        }

        // 更新其他属性
        if (!string.IsNullOrEmpty(request.Name)) project.Name = request.Name;
        if (!string.IsNullOrEmpty(request.WorkNo)) project.WorkNo = request.WorkNo;
        if (!string.IsNullOrEmpty(request.Capacity)) project.Capacity = request.Capacity;
        if (!string.IsNullOrEmpty(request.Model)) project.Model = request.Model;
        if (!string.IsNullOrEmpty(request.Remark)) project.Remark = request.Remark;
        if (request.StartDate.HasValue) project.StartDate = request.StartDate.Value;
        if (request.EndDate.HasValue) project.EndDate = request.EndDate.Value;
        // 使用 HasValue 判断属性是否在请求中发送了
        if (request.IsKeyProject.HasValue) project.IsKeyProject = request.IsKeyProject.Value;
        if (request.IsWon.HasValue) project.IsWon = request.IsWon.Value;
        if (request.IsForeign.HasValue) project.IsForeign = request.IsForeign.Value;
        if (request.IsCommissioned.HasValue) project.IsCommissioned = request.IsCommissioned.Value;
        if (request.IsCompleted.HasValue) project.IsCompleted = request.IsCompleted.Value;

        if (_projectRepository != null)
        {
            project = await _projectRepository.UpdateAsync(project);
        }
        else
        {
            var index = DefaultProjects.FindIndex(p => p.Id == id);
            if (index >= 0) DefaultProjects[index] = project;
        }

        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<bool> SoftDeleteProjectAsync(string id)
    {
        if (_projectRepository == null)
        {
            var removed = DefaultProjects.RemoveAll(p => p.Id == id);
            return removed > 0;
        }

        return await _projectRepository.SoftDeleteAsync(id);
    }

    public async Task<bool> IsProjectInUseAsync(string id)
    {
        if (_projectRepository == null) return false;
        return await _projectRepository.CountTasksByProjectIdAsync(id) > 0;
    }

    public async Task<ProjectStatisticsResponse> GetStatisticsAsync(string? category)
    {
        List<Project> projects;
        if (_projectRepository != null)
        {
            try
            {
                projects = (await _projectRepository.GetAllAsync()).ToList();
            }
            catch
            {
                projects = DefaultProjects.ToList();
            }
        }
        else
        {
            projects = DefaultProjects.ToList();
        }

        Domain.Enums.ProjectCategory? categoryEnum = null;
        if (!string.IsNullOrEmpty(category) && Enum.TryParse<Domain.Enums.ProjectCategory>(category, out var cat))
            categoryEnum = cat;

        var byCategory = projects.GroupBy(p => p.Category).ToDictionary(g => g.Key.ToString(), g => g.Count());
        var keyProjects = projects.Count(p => p.IsKeyProject);
        var completed = projects.Count(p => p.IsCompleted);

        return new ProjectStatisticsResponse
        {
            Total = projects.Count,
            ByCategory = byCategory,
            KeyProjects = keyProjects,
            Completed = completed
        };
    }

    private async Task<Project?> GetProjectEntityByIdAsync(string id)
    {
        var defaultProject = DefaultProjects.FirstOrDefault(p => p.Id == id);
        if (defaultProject != null) return defaultProject;

        if (_projectRepository == null) return null;

        return await _projectRepository.GetByIdAsync(id);
    }
}
