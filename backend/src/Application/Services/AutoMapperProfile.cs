using AutoMapper;
using TaskManageSystem.Application.DTOs.Projects;
using TaskManageSystem.Application.DTOs.TaskClasses;
using TaskManageSystem.Application.DTOs.TaskPool;
using TaskManageSystem.Application.DTOs.Tasks;
using TaskManageSystem.Application.DTOs.Users;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// AutoMapper 配置文件
/// </summary>
public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserID))
            .ForMember(dest => dest.SystemRole, opt => opt.MapFrom(src => src.SystemRole.ToString()))
            .ForMember(dest => dest.OfficeLocation, opt => opt.MapFrom(src => src.OfficeLocation.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<CreateUserRequest, User>()
            .ForMember(dest => dest.SystemRole, opt => opt.MapFrom(src => Enum.Parse<SystemRole>(src.SystemRole, true)))
            .ForMember(dest => dest.OfficeLocation, opt => opt.MapFrom(src => Enum.Parse<OfficeLocation>(src.OfficeLocation, true)))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<PersonnelStatus>(src.Status, true)));
        CreateMap<UpdateUserRequest, User>()
            .ForMember(dest => dest.SystemRole, opt => opt.MapFrom(src => Enum.Parse<SystemRole>(src.SystemRole, true)))
            .ForMember(dest => dest.OfficeLocation, opt => opt.MapFrom(src => Enum.Parse<OfficeLocation>(src.OfficeLocation, true)))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<PersonnelStatus>(src.Status, true)));

        // Project mappings
        CreateMap<Project, ProjectDto>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()));
        CreateMap<CreateProjectRequest, Project>();
        CreateMap<UpdateProjectRequest, Project>();

        // Task mappings
        CreateMap<TaskItem, TaskDto>()
            .ForMember(dest => dest.TaskId, opt => opt.MapFrom(src => src.TaskID))
            .ForMember(dest => dest.TaskClassId, opt => opt.MapFrom(src => src.TaskClassID))
            .ForMember(dest => dest.ProjectId, opt => opt.MapFrom(src => src.ProjectID))
            .ForMember(dest => dest.AssigneeId, opt => opt.MapFrom(src => src.AssigneeID))
            .ForMember(dest => dest.CheckerId, opt => opt.MapFrom(src => src.CheckerID))
            .ForMember(dest => dest.ChiefDesignerId, opt => opt.MapFrom(src => src.ChiefDesignerID))
            .ForMember(dest => dest.ApproverId, opt => opt.MapFrom(src => src.ApproverID))
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToString("yyyy-MM-dd")))
            .ForMember(dest => dest.CheckerStatus, opt => opt.MapFrom(src => src.CheckerStatus.HasValue ? src.CheckerStatus.Value.ToString() : null))
            .ForMember(dest => dest.ChiefDesignerStatus, opt => opt.MapFrom(src => src.ChiefDesignerStatus.HasValue ? src.ChiefDesignerStatus.Value.ToString() : null))
            .ForMember(dest => dest.ApproverStatus, opt => opt.MapFrom(src => src.ApproverStatus.HasValue ? src.ApproverStatus.Value.ToString() : null))
            .ForMember(dest => dest.AssigneeStatus, opt => opt.MapFrom(src => src.AssigneeStatus.HasValue ? src.AssigneeStatus.Value.ToString() : null))
            .ForMember(dest => dest.RelatedProject, opt => opt.MapFrom(src => src.RelatedProject))
            .ForMember(dest => dest.IsIndependentBusinessUnit, opt => opt.MapFrom(src => src.IsIndependentBusinessUnit))
            .ForMember(dest => dest.IsForceAssessment, opt => opt.MapFrom(src => src.IsForceAssessment))
            // Participants 存储为JSON字符串，在TaskService中手动解析
            .ForMember(dest => dest.Participants, opt => opt.Ignore())
            .ForMember(dest => dest.ParticipantNames, opt => opt.Ignore());
        CreateMap<CreateTaskRequest, TaskItem>();

        // TaskClass mappings
        CreateMap<TaskClass, TaskClassDto>()
            .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Code.ToString()));

        // TaskPoolItem mappings
        CreateMap<TaskPoolItem, TaskPoolItemDto>()
            .ForMember(dest => dest.TaskClassId, opt => opt.MapFrom(src => src.TaskClassID))
            .ForMember(dest => dest.ProjectId, opt => opt.MapFrom(src => src.ProjectID))
            .ForMember(dest => dest.PersonInChargeId, opt => opt.MapFrom(src => src.PersonInChargeID))
            .ForMember(dest => dest.CheckerId, opt => opt.MapFrom(src => src.CheckerID))
            .ForMember(dest => dest.ChiefDesignerId, opt => opt.MapFrom(src => src.ChiefDesignerID))
            .ForMember(dest => dest.ApproverId, opt => opt.MapFrom(src => src.ApproverID));
        CreateMap<CreateTaskPoolItemRequest, TaskPoolItem>()
            .ForMember(dest => dest.TaskClassID, opt => opt.MapFrom(src => src.TaskClassId))
            .ForMember(dest => dest.ProjectID, opt => opt.MapFrom(src => src.ProjectId))
            .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.ProjectName))
            .ForMember(dest => dest.PersonInChargeID, opt => opt.MapFrom(src => src.PersonInChargeId))
            .ForMember(dest => dest.PersonInChargeName, opt => opt.MapFrom(src => src.PersonInChargeName))
            .ForMember(dest => dest.CheckerID, opt => opt.MapFrom(src => src.CheckerId))
            .ForMember(dest => dest.CheckerName, opt => opt.MapFrom(src => src.CheckerName))
            .ForMember(dest => dest.ChiefDesignerID, opt => opt.MapFrom(src => src.ChiefDesignerId))
            .ForMember(dest => dest.ChiefDesignerName, opt => opt.MapFrom(src => src.ChiefDesignerName))
            .ForMember(dest => dest.ApproverID, opt => opt.MapFrom(src => src.ApproverId))
            .ForMember(dest => dest.ApproverName, opt => opt.MapFrom(src => src.ApproverName))
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy))
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByName))
            .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate));
    }
}
