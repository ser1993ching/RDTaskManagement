using AutoMapper;
using R&DTaskSystem.Application.DTOs.Projects;
using R&DTaskSystem.Application.DTOs.TaskClasses;
using R&DTaskSystem.Application.DTOs.Tasks;
using R&DTaskSystem.Application.DTOs.Users;
using R&DTaskSystem.Domain.Entities;

namespace R&DTaskSystem.Application.Services;

/// <summary>
/// AutoMapper 配置文件
/// </summary>
public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.SystemRole, opt => opt.MapFrom(src => src.SystemRole.ToString()))
            .ForMember(dest => dest.OfficeLocation, opt => opt.MapFrom(src => src.OfficeLocation.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<CreateUserRequest, User>();
        CreateMap<UpdateUserRequest, User>();

        // Project mappings
        CreateMap<Project, ProjectDto>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()));
        CreateMap<CreateProjectRequest, Project>();
        CreateMap<UpdateProjectRequest, Project>();

        // Task mappings
        CreateMap<Task, TaskDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToString("yyyy-MM-dd")))
            .ForMember(dest => dest.CheckerStatus, opt => opt.MapFrom(src => src.CheckerStatus?.ToString()))
            .ForMember(dest => dest.ChiefDesignerStatus, opt => opt.MapFrom(src => src.ChiefDesignerStatus?.ToString()))
            .ForMember(dest => dest.ApproverStatus, opt => opt.MapFrom(src => src.ApproverStatus?.ToString()))
            .ForMember(dest => dest.AssigneeStatus, opt => opt.MapFrom(src => src.AssigneeStatus?.ToString()));

        // TaskClass mappings
        CreateMap<TaskClass, TaskClassDto>()
            .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Code.ToString()));

        // TaskPoolItem mappings
        CreateMap<TaskPoolItem, TaskPoolItemDto>();
    }
}
