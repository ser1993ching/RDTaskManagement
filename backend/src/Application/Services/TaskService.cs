using AutoMapper;
using TaskManageSystem.Application.DTOs.Common;
using TaskManageSystem.Application.DTOs.Tasks;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Repositories;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 任务服务实现
/// </summary>
public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IMapper _mapper;

    public TaskService(ITaskRepository taskRepository, IMapper mapper)
    {
        _taskRepository = taskRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResponse<TaskDto>> GetTasksAsync(TaskQueryParams query)
    {
        var tasks = await _taskRepository.GetAllAsync();

        // 过滤
        if (!string.IsNullOrEmpty(query.Status))
        {
            if (Enum.TryParse<Domain.Enums.TaskStatus>(query.Status, out var status))
                tasks = tasks.Where(t => t.Status == status).ToList();
        }

        if (!string.IsNullOrEmpty(query.TaskClassID))
            tasks = tasks.Where(t => t.TaskClassID == query.TaskClassID).ToList();

        if (!string.IsNullOrEmpty(query.ProjectID))
            tasks = tasks.Where(t => t.ProjectID == query.ProjectID).ToList();

        if (!string.IsNullOrEmpty(query.AssigneeID))
            tasks = tasks.Where(t => t.AssigneeID == query.AssigneeID).ToList();

        if (!string.IsNullOrEmpty(query.CheckerID))
            tasks = tasks.Where(t => t.CheckerID == query.CheckerID).ToList();

        if (!string.IsNullOrEmpty(query.ApproverID))
            tasks = tasks.Where(t => t.ApproverID == query.ApproverID).ToList();

        var total = tasks.Count;
        var pages = (int)Math.Ceiling(total / (double)query.PageSize);

        tasks = tasks.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToList();

        return new PaginatedResponse<TaskDto>
        {
            Data = _mapper.Map<List<TaskDto>>(tasks),
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize,
            Pages = pages
        };
    }

    public async Task<TaskDto?> GetTaskByIdAsync(string taskId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        return task == null ? null : _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskRequest request)
    {
        var task = _mapper.Map<TaskItem>(request);

        // 生成任务ID
        task.TaskID = $"T-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";

        task.Status = Domain.Enums.TaskStatus.NotStarted;

        task.CreatedDate = DateTime.UtcNow;

        task = await _taskRepository.CreateAsync(task);
        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> UpdateTaskAsync(string taskId, CreateTaskRequest request)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        _mapper.Map(request, task);
        task = await _taskRepository.UpdateAsync(task);
        return _mapper.Map<TaskDto>(task);
    }

    public async Task<bool> SoftDeleteTaskAsync(string taskId)
    {
        return await _taskRepository.SoftDeleteAsync(taskId);
    }

    public async Task<TaskDto> UpdateTaskStatusAsync(string taskId, string status)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        if (Enum.TryParse<Domain.Enums.TaskStatus>(status, out var newStatus))
        {
            task.Status = newStatus;
            if (newStatus == Domain.Enums.TaskStatus.Completed)
                task.CompletedDate = DateTime.UtcNow;
        }

        task = await _taskRepository.UpdateAsync(task);
        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> UpdateRoleStatusAsync(string taskId, UpdateRoleStatusRequest request)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        if (Enum.TryParse<RoleStatus>(request.Status, out var status))
        {
            switch (request.Role.ToLower())
            {
                case "assignee":
                    task.AssigneeStatus = status;
                    break;
                case "checker":
                    task.CheckerStatus = status;
                    break;
                case "chiefdesigner":
                    task.ChiefDesignerStatus = status;
                    break;
                case "approver":
                    task.ApproverStatus = status;
                    break;
            }
        }

        task = await _taskRepository.UpdateAsync(task);
        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> CompleteAllRolesAsync(string taskId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        task.AssigneeStatus = RoleStatus.Completed;
        task.CheckerStatus = RoleStatus.Completed;
        task.ChiefDesignerStatus = RoleStatus.Completed;
        task.ApproverStatus = RoleStatus.Completed;
        task.Status = Domain.Enums.TaskStatus.Completed;
        task.CompletedDate = DateTime.UtcNow;

        task = await _taskRepository.UpdateAsync(task);
        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> RetrieveToPoolAsync(string taskId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        task.IsInPool = true;
        task.AssigneeID = null;
        task.AssigneeName = null;
        task.CheckerID = null;
        task.ChiefDesignerID = null;
        task.ApproverID = null;
        task.AssigneeStatus = null;
        task.CheckerStatus = null;
        task.ChiefDesignerStatus = null;
        task.ApproverStatus = null;

        task = await _taskRepository.UpdateAsync(task);
        return _mapper.Map<TaskDto>(task);
    }

    public async Task<PersonalTasksResponse> GetPersonalTasksAsync(string userId)
    {
        var tasks = await _taskRepository.GetPersonalTasksAsync(userId, null);

        var response = new PersonalTasksResponse
        {
            InProgress = _mapper.Map<List<TaskDto>>(tasks.Where(t =>
                t.Status == Domain.Enums.TaskStatus.Drafting || t.Status == Domain.Enums.TaskStatus.Revising ||
                t.AssigneeStatus == RoleStatus.InProgress || t.CheckerStatus == RoleStatus.InProgress ||
                t.ChiefDesignerStatus == RoleStatus.InProgress || t.ApproverStatus == RoleStatus.InProgress)),
            Pending = _mapper.Map<List<TaskDto>>(tasks.Where(t => t.Status == Domain.Enums.TaskStatus.NotStarted)),
            Completed = _mapper.Map<List<TaskDto>>(tasks.Where(t => t.Status == Domain.Enums.TaskStatus.Completed))
        };

        return response;
    }

    public async Task<TravelTasksResponse> GetTravelTasksAsync(string userId, string? period)
    {
        var tasks = await _taskRepository.GetTravelTasksAsync(userId, period);
        var totalDays = tasks.Sum(t => t.TravelDuration ?? 0);

        return new TravelTasksResponse
        {
            Tasks = _mapper.Map<List<TaskDto>>(tasks),
            TotalDays = totalDays
        };
    }

    public async Task<MeetingTasksResponse> GetMeetingTasksAsync(string userId, string? period)
    {
        var tasks = await _taskRepository.GetMeetingTasksAsync(userId, period);
        var totalHours = tasks.Sum(t => t.MeetingDuration ?? 0);

        return new MeetingTasksResponse
        {
            Tasks = _mapper.Map<List<TaskDto>>(tasks),
            TotalHours = totalHours
        };
    }

    public async Task<bool> IsLongRunningTaskAsync(string taskId)
    {
        return await _taskRepository.IsLongRunningAsync(taskId);
    }

    public async Task BatchOperationAsync(BatchOperationRequest request)
    {
        foreach (var taskId in request.TaskIds)
        {
            if (request.Action == "delete")
            {
                await _taskRepository.SoftDeleteAsync(taskId);
            }
        }
    }
}
