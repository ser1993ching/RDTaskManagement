using AutoMapper;
using System.ComponentModel.DataAnnotations;
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
    private readonly ITaskRepository? _taskRepository;
    private readonly IMapper _mapper;
    private static readonly List<TaskItem> DefaultTasks = new();

    public TaskService(ITaskRepository? taskRepository, IMapper mapper)
    {
        _taskRepository = taskRepository;
        _mapper = mapper;
    }

    // 辅助方法：解析 JSON 字符串为列表
    private List<string> ParseJsonList(string? json)
    {
        if (string.IsNullOrEmpty(json)) return new List<string>();
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    public async Task<PaginatedResponse<TaskDto>> GetTasksAsync(TaskQueryParams query)
    {
        List<TaskItem> tasks;

        if (_taskRepository != null)
        {
            try
            {
                tasks = (await _taskRepository.GetAllAsync()).ToList();
            }
            catch
            {
                tasks = DefaultTasks.ToList();
            }
        }
        else
        {
            tasks = DefaultTasks.ToList();
        }

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

        // 手动映射以处理 Participants JSON
        var taskDtos = tasks.Select(t =>
        {
            var dto = _mapper.Map<TaskDto>(t);
            dto.Participants = ParseJsonList(t.Participants);
            return dto;
        }).ToList();

        return new PaginatedResponse<TaskDto>
        {
            Data = taskDtos,
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize,
            Pages = pages
        };
    }

    public async Task<TaskDto?> GetTaskByIdAsync(string taskId)
    {
        var defaultTask = DefaultTasks.FirstOrDefault(t => t.TaskID == taskId);
        if (defaultTask != null) return _mapper.Map<TaskDto>(defaultTask);

        if (_taskRepository == null) return null;

        var task = await _taskRepository.GetByIdAsync(taskId);
        return task == null ? null : _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskRequest request)
    {
        if (_taskRepository == null)
        {
            var task = _mapper.Map<TaskItem>(request);
            task.TaskID = $"T-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";
            task.Status = Domain.Enums.TaskStatus.NotStarted;
            task.CreatedDate = DateTime.UtcNow;
            DefaultTasks.Add(task);
            return _mapper.Map<TaskDto>(task);
        }

        var dbTask = _mapper.Map<TaskItem>(request);
        dbTask.TaskID = $"T-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";
        dbTask.Status = Domain.Enums.TaskStatus.NotStarted;
        dbTask.CreatedDate = DateTime.UtcNow;
        dbTask = await _taskRepository.CreateAsync(dbTask);
        return _mapper.Map<TaskDto>(dbTask);
    }

    public async Task<TaskDto> UpdateTaskAsync(string taskId, CreateTaskRequest request)
    {
        var task = await GetTaskEntityByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        // 手动更新每个字段，避免值类型默认值覆盖问题
        task.TaskName = request.TaskName;
        task.TaskClassID = request.TaskClassID;
        task.Category = request.Category;
        task.ProjectID = request.ProjectID;
        task.AssigneeID = request.AssigneeID;
        task.AssigneeName = request.AssigneeName;
        task.StartDate = request.StartDate;
        task.DueDate = request.DueDate;
        task.Difficulty = request.Difficulty;
        task.Remark = request.Remark;

        // 只更新IsForceAssessment当它被明确传递时（不为null）
        if (request.IsForceAssessment.HasValue)
        {
            task.IsForceAssessment = request.IsForceAssessment.Value;
        }

        // 角色分配
        task.CheckerID = request.CheckerID;
        task.ChiefDesignerID = request.ChiefDesignerID;
        task.ApproverID = request.ApproverID;

        // 差旅任务
        task.TravelLocation = request.TravelLocation;
        task.TravelDuration = request.TravelDuration;
        task.TravelLabel = request.TravelLabel;

        // 会议任务
        task.MeetingDuration = request.MeetingDuration;
        task.Participants = request.Participants != null
            ? System.Text.Json.JsonSerializer.Serialize(request.Participants)
            : null;

        // 市场任务
        task.RelatedProject = request.RelatedProject;

        // 工作量
        task.Workload = request.Workload;

        if (_taskRepository != null)
        {
            task = await _taskRepository.UpdateAsync(task);
        }
        else
        {
            var index = DefaultTasks.FindIndex(t => t.TaskID == taskId);
            if (index >= 0) DefaultTasks[index] = task;
        }

        return _mapper.Map<TaskDto>(task);
    }

    public async Task<bool> SoftDeleteTaskAsync(string taskId)
    {
        if (_taskRepository == null)
        {
            var removed = DefaultTasks.RemoveAll(t => t.TaskID == taskId);
            return removed > 0;
        }

        return await _taskRepository.SoftDeleteAsync(taskId);
    }

    public async Task<TaskDto> UpdateTaskStatusAsync(string taskId, string status)
    {
        var task = await GetTaskEntityByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        // 使用中文 Display Name 进行匹配
        var newStatus = Domain.Enums.TaskStatus.NotStarted;
        var matched = false;
        foreach (Domain.Enums.TaskStatus s in Enum.GetValues(typeof(Domain.Enums.TaskStatus)))
        {
            var displayAttr = s.GetType().GetField(s.ToString())?
                .GetCustomAttributes(typeof(DisplayAttribute), false)
                .FirstOrDefault() as DisplayAttribute;
            if (displayAttr != null && displayAttr.Name == status)
            {
                newStatus = s;
                matched = true;
                break;
            }
        }

        if (matched)
        {
            task.Status = newStatus;
            if (newStatus == Domain.Enums.TaskStatus.Completed)
                task.CompletedDate = DateTime.UtcNow;
        }

        if (_taskRepository != null)
        {
            task = await _taskRepository.UpdateAsync(task);
        }
        else
        {
            var index = DefaultTasks.FindIndex(t => t.TaskID == taskId);
            if (index >= 0) DefaultTasks[index] = task;
        }

        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> UpdateRoleStatusAsync(string taskId, UpdateRoleStatusRequest request)
    {
        var task = await GetTaskEntityByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        if (Enum.TryParse<RoleStatus>(request.Status, ignoreCase: true, out var status))
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

        if (_taskRepository != null)
        {
            task = await _taskRepository.UpdateAsync(task);
        }
        else
        {
            var index = DefaultTasks.FindIndex(t => t.TaskID == taskId);
            if (index >= 0) DefaultTasks[index] = task;
        }

        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> CompleteAllRolesAsync(string taskId)
    {
        var task = await GetTaskEntityByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        task.AssigneeStatus = RoleStatus.Completed;
        task.CheckerStatus = RoleStatus.Completed;
        task.ChiefDesignerStatus = RoleStatus.Completed;
        task.ApproverStatus = RoleStatus.Completed;
        task.Status = Domain.Enums.TaskStatus.Completed;
        task.CompletedDate = DateTime.UtcNow;

        if (_taskRepository != null)
        {
            task = await _taskRepository.UpdateAsync(task);
        }
        else
        {
            var index = DefaultTasks.FindIndex(t => t.TaskID == taskId);
            if (index >= 0) DefaultTasks[index] = task;
        }

        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> RetrieveToPoolAsync(string taskId)
    {
        var task = await GetTaskEntityByIdAsync(taskId);
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

        if (_taskRepository != null)
        {
            task = await _taskRepository.UpdateAsync(task);
        }
        else
        {
            var index = DefaultTasks.FindIndex(t => t.TaskID == taskId);
            if (index >= 0) DefaultTasks[index] = task;
        }

        return _mapper.Map<TaskDto>(task);
    }

    public async Task<PersonalTasksResponse> GetPersonalTasksAsync(string userId)
    {
        List<TaskItem> tasks;

        if (_taskRepository != null)
        {
            try
            {
                tasks = (await _taskRepository.GetPersonalTasksAsync(userId, null)).ToList();
            }
            catch
            {
                tasks = DefaultTasks.Where(t => t.AssigneeID == userId).ToList();
            }
        }
        else
        {
            tasks = DefaultTasks.Where(t => t.AssigneeID == userId).ToList();
        }

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
        List<TaskItem> tasks;

        if (_taskRepository != null)
        {
            try
            {
                tasks = (await _taskRepository.GetTravelTasksAsync(userId, period)).ToList();
            }
            catch
            {
                tasks = DefaultTasks.Where(t => t.AssigneeID == userId && t.TaskClassID == "TC009").ToList();
            }
        }
        else
        {
            tasks = DefaultTasks.Where(t => t.AssigneeID == userId && t.TaskClassID == "TC009").ToList();
        }

        var totalDays = tasks.Sum(t => t.TravelDuration ?? 0);

        return new TravelTasksResponse
        {
            Tasks = _mapper.Map<List<TaskDto>>(tasks),
            TotalDays = totalDays
        };
    }

    public async Task<MeetingTasksResponse> GetMeetingTasksAsync(string userId, string? period)
    {
        List<TaskItem> tasks;

        if (_taskRepository != null)
        {
            try
            {
                tasks = (await _taskRepository.GetMeetingTasksAsync(userId, period)).ToList();
            }
            catch
            {
                tasks = DefaultTasks.Where(t => t.AssigneeID == userId && t.TaskClassID == "TC007").ToList();
            }
        }
        else
        {
            tasks = DefaultTasks.Where(t => t.AssigneeID == userId && t.TaskClassID == "TC007").ToList();
        }

        var totalHours = tasks.Sum(t => t.MeetingDuration ?? 0);

        return new MeetingTasksResponse
        {
            Tasks = _mapper.Map<List<TaskDto>>(tasks),
            TotalHours = totalHours
        };
    }

    public async Task<bool> IsLongRunningTaskAsync(string taskId)
    {
        if (_taskRepository == null) return false;
        return await _taskRepository.IsLongRunningAsync(taskId);
    }

    public async Task BatchOperationAsync(BatchOperationRequest request)
    {
        if (_taskRepository != null)
        {
            foreach (var taskId in request.TaskIds)
            {
                if (request.Action == "delete")
                {
                    await _taskRepository.SoftDeleteAsync(taskId);
                }
            }
        }
        else
        {
            foreach (var taskId in request.TaskIds)
            {
                if (request.Action == "delete")
                {
                    DefaultTasks.RemoveAll(t => t.TaskID == taskId);
                }
            }
        }
    }

    private async Task<TaskItem?> GetTaskEntityByIdAsync(string taskId)
    {
        var defaultTask = DefaultTasks.FirstOrDefault(t => t.TaskID == taskId);
        if (defaultTask != null) return defaultTask;

        if (_taskRepository == null) return null;

        return await _taskRepository.GetByIdAsync(taskId);
    }
}
