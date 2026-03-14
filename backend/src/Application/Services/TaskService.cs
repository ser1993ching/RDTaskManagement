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
/// 任务服务实现 (TaskService)
///
/// 概述:
/// - 实现ITaskService接口定义的业务逻辑
/// - 负责任务的CRUD、状态管理、角色状态更新等核心功能
/// - 与TaskRepository协作进行数据持久化
///
/// 主要功能:
/// 1. 任务查询 - 支持多种过滤条件和分页
/// 2. 任务创建 - 自动生成ID，设置初始状态
/// 3. 任务更新 - 更新任务属性，处理特殊任务类型
/// 4. 任务删除 - 软删除机制
/// 5. 状态管理 - 更新任务状态和角色状态
/// 6. 特殊任务处理 - 会议培训、差旅任务的特殊逻辑
///
/// 设计特点:
/// 1. 依赖注入 - 通过构造函数注入IRepository和IMapper
/// 2. 缓存优化 - 缓存RoleStatus枚举的DisplayName映射
/// 3. 错误处理 - 抛出有意义的异常信息
/// 4. 业务规则 - 会议培训/差旅任务自动完成等
/// </summary>
public class TaskService : ITaskService
{
    private readonly ITaskRepository? _taskRepository;
    private readonly IMapper _mapper;
    private static readonly List<TaskItem> DefaultTasks = new();

    // 会议培训任务类别ID
    private const string MeetingTrainingTaskClassId = "TC007";
    // 差旅任务类别ID
    private const string TravelTaskClassId = "TC009";

    // 缓存 RoleStatus 枚举的 Display Name 映射，避免每次反射
    private static readonly Dictionary<string, RoleStatus> RoleStatusMap;

    static TaskService()
    {
        RoleStatusMap = new Dictionary<string, RoleStatus>(StringComparer.Ordinal);
        foreach (RoleStatus s in Enum.GetValues(typeof(RoleStatus)))
        {
            var displayAttr = s.GetType().GetField(s.ToString())?
                .GetCustomAttributes(typeof(DisplayAttribute), false)
                .FirstOrDefault() as DisplayAttribute;
            if (displayAttr?.Name != null)
            {
                RoleStatusMap[displayAttr.Name] = s;
            }
        }
    }

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

    /// <summary>
    /// 判断是否为会议培训或差旅任务
    /// </summary>
    private bool IsMeetingOrTravelTask(string taskClassId)
    {
        return taskClassId == MeetingTrainingTaskClassId || taskClassId == TravelTaskClassId;
    }

    /// <summary>
    /// 清除会议培训或差旅任务的非负责人角色字段
    /// 会议培训任务(TC007)和差旅任务(TC009)只能分配负责人
    /// </summary>
    private void ClearNonAssigneeFieldsForMeetingOrTravelTask(CreateTaskRequest request)
    {
        if (IsMeetingOrTravelTask(request.TaskClassId))
        {
            request.CheckerId = null;
            request.ChiefDesignerId = null;
            request.ApproverId = null;
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
        // 会议培训或差旅任务：清除非负责人角色字段
        ClearNonAssigneeFieldsForMeetingOrTravelTask(request);

        // 判断是否为会议培训或差旅任务
        bool isMeetingOrTravel = IsMeetingOrTravelTask(request.TaskClassId);

        if (_taskRepository == null)
        {
            var task = _mapper.Map<TaskItem>(request);
            task.TaskID = $"T-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";
            // 会议培训或差旅任务自动设置为已完成状态
            task.Status = isMeetingOrTravel ? Domain.Enums.TaskStatus.Completed : Domain.Enums.TaskStatus.NotStarted;
            task.CreatedDate = DateTime.UtcNow;
            // 会议培训或差旅任务自动设置负责人完成状态和完成时间
            if (isMeetingOrTravel)
            {
                task.AssigneeStatus = RoleStatus.Completed;
                task.CompletedDate = DateTime.UtcNow;
            }
            DefaultTasks.Add(task);
            return _mapper.Map<TaskDto>(task);
        }

        var dbTask = _mapper.Map<TaskItem>(request);
        dbTask.TaskID = $"T-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";
        // 会议培训或差旅任务自动设置为已完成状态
        dbTask.Status = isMeetingOrTravel ? Domain.Enums.TaskStatus.Completed : Domain.Enums.TaskStatus.NotStarted;
        dbTask.CreatedDate = DateTime.UtcNow;
        // 会议培训或差旅任务自动设置负责人完成状态和完成时间
        if (isMeetingOrTravel)
        {
            dbTask.AssigneeStatus = RoleStatus.Completed;
            dbTask.CompletedDate = DateTime.UtcNow;
        }
        dbTask = await _taskRepository.CreateAsync(dbTask);
        return _mapper.Map<TaskDto>(dbTask);
    }

    public async Task<TaskDto> UpdateTaskAsync(string taskId, CreateTaskRequest request)
    {
        var task = await GetTaskEntityByIdAsync(taskId);
        if (task == null) throw new KeyNotFoundException($"Task {taskId} not found");

        // 只更新非空/非默认值的字段，避免覆盖已有数据
        if (!string.IsNullOrEmpty(request.TaskName))
            task.TaskName = request.TaskName;

        if (!string.IsNullOrEmpty(request.TaskClassId))
            task.TaskClassID = request.TaskClassId;

        if (!string.IsNullOrEmpty(request.Category))
            task.Category = request.Category;

        if (request.ProjectId != null)
            task.ProjectID = request.ProjectId;

        if (request.AssigneeId != null)
            task.AssigneeID = request.AssigneeId;

        if (request.AssigneeName != null)
            task.AssigneeName = request.AssigneeName;

        if (request.StartDate.HasValue)
            task.StartDate = request.StartDate;

        if (request.DueDate.HasValue)
            task.DueDate = request.DueDate;

        if (request.Difficulty.HasValue)
            task.Difficulty = request.Difficulty;

        if (request.Remark != null)
            task.Remark = request.Remark;

        // 只更新IsForceAssessment当它被明确传递时（不为null）
        if (request.IsForceAssessment.HasValue)
        {
            task.IsForceAssessment = request.IsForceAssessment.Value;
        }

        // 角色分配 - 只有非null才更新
        if (request.CheckerId != null)
            task.CheckerID = request.CheckerId;

        if (request.ChiefDesignerId != null)
            task.ChiefDesignerID = request.ChiefDesignerId;

        if (request.ApproverId != null)
            task.ApproverID = request.ApproverId;

        // 差旅任务
        if (request.TravelLocation != null)
            task.TravelLocation = request.TravelLocation;

        if (request.TravelDuration.HasValue)
            task.TravelDuration = request.TravelDuration;

        if (request.TravelLabel != null)
            task.TravelLabel = request.TravelLabel;

        // 会议任务
        if (request.MeetingDuration.HasValue)
            task.MeetingDuration = request.MeetingDuration;

        if (request.Participants != null)
            task.Participants = System.Text.Json.JsonSerializer.Serialize(request.Participants);

        // 市场任务
        if (request.RelatedProject != null)
            task.RelatedProject = request.RelatedProject;

        // 工作量 - 只有非null才更新
        if (request.Workload.HasValue)
            task.Workload = request.Workload;

        if (request.CheckerWorkload.HasValue)
            task.CheckerWorkload = request.CheckerWorkload;

        if (request.ChiefDesignerWorkload.HasValue)
            task.ChiefDesignerWorkload = request.ChiefDesignerWorkload;

        if (request.ApproverWorkload.HasValue)
            task.ApproverWorkload = request.ApproverWorkload;

        // 东方任务类型
        if (request.DongfangTaskType != null)
            task.DongfangTaskType = request.DongfangTaskType;

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

        // 使用缓存的映射进行匹配，避免每次反射
        var matched = RoleStatusMap.TryGetValue(request.Status, out var newStatus);
        if (!matched)
        {
            newStatus = RoleStatus.NotStarted;
        }

        if (matched)
        {
            switch (request.Role.ToLower())
            {
                case "assignee":
                    task.AssigneeStatus = newStatus;
                    break;
                case "checker":
                    task.CheckerStatus = newStatus;
                    break;
                case "chiefdesigner":
                    task.ChiefDesignerStatus = newStatus;
                    break;
                case "approver":
                    task.ApproverStatus = newStatus;
                    break;
            }

            // 如果所有角色状态都是已完成，更新全局任务状态
            // 对于会议/差旅任务，只需负责人完成即可
            bool allRolesCompleted = IsMeetingOrTravelTask(task.TaskClassID)
                ? task.AssigneeStatus == RoleStatus.Completed
                : task.AssigneeStatus == RoleStatus.Completed &&
                  task.CheckerStatus == RoleStatus.Completed &&
                  task.ChiefDesignerStatus == RoleStatus.Completed &&
                  task.ApproverStatus == RoleStatus.Completed;

            if (allRolesCompleted)
            {
                task.Status = Domain.Enums.TaskStatus.Completed;
                task.CompletedDate = DateTime.UtcNow;
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

        // 会议培训或差旅任务：只设置负责人状态
        if (IsMeetingOrTravelTask(task.TaskClassID))
        {
            task.AssigneeStatus = RoleStatus.Completed;
        }
        else
        {
            // 普通任务：设置所有角色状态
            task.AssigneeStatus = RoleStatus.Completed;
            task.CheckerStatus = RoleStatus.Completed;
            task.ChiefDesignerStatus = RoleStatus.Completed;
            task.ApproverStatus = RoleStatus.Completed;
        }

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
                tasks = DefaultTasks.Where(t => t.AssigneeID == userId && !t.IsDeleted).ToList();
            }
        }
        else
        {
            tasks = DefaultTasks.Where(t => t.AssigneeID == userId && !t.IsDeleted).ToList();
        }

        // 已完成：全局状态为已完成
        // 对于会议/差旅任务，完成条件是 AssigneeStatus == Completed
        // 对于普通任务，任一角色状态为已完成即算完成
        var completedTasks = tasks.Where(t =>
            t.Status == Domain.Enums.TaskStatus.Completed ||
            (IsMeetingOrTravelTask(t.TaskClassID) && t.AssigneeStatus == RoleStatus.Completed) ||
            (!IsMeetingOrTravelTask(t.TaskClassID) &&
                (t.AssigneeStatus == RoleStatus.Completed ||
                 t.CheckerStatus == RoleStatus.Completed ||
                 t.ChiefDesignerStatus == RoleStatus.Completed ||
                 t.ApproverStatus == RoleStatus.Completed))).ToList();

        // 进行中：全局状态为 Drafting/Revising，或任一角色状态为进行中/修改中/已驳回，且不在已完成中
        var inProgressTasks = tasks.Where(t =>
            !completedTasks.Contains(t) && (
            t.Status == Domain.Enums.TaskStatus.Drafting || t.Status == Domain.Enums.TaskStatus.Revising ||
            t.AssigneeStatus == RoleStatus.InProgress || t.AssigneeStatus == RoleStatus.Revising || t.AssigneeStatus == RoleStatus.Rejected ||
            t.CheckerStatus == RoleStatus.InProgress || t.CheckerStatus == RoleStatus.Revising || t.CheckerStatus == RoleStatus.Rejected ||
            t.ChiefDesignerStatus == RoleStatus.InProgress || t.ChiefDesignerStatus == RoleStatus.Revising || t.ChiefDesignerStatus == RoleStatus.Rejected ||
            t.ApproverStatus == RoleStatus.InProgress || t.ApproverStatus == RoleStatus.Revising || t.ApproverStatus == RoleStatus.Rejected)).ToList();

        // 未开始：剩下的任务（全局状态为 NotStarted，且所有角色状态都不是进行中/已完成）
        var pendingTasks = tasks.Where(t =>
            !completedTasks.Contains(t) &&
            !inProgressTasks.Contains(t)).ToList();

        var response = new PersonalTasksResponse
        {
            InProgress = _mapper.Map<List<TaskDto>>(inProgressTasks),
            Pending = _mapper.Map<List<TaskDto>>(pendingTasks),
            Completed = _mapper.Map<List<TaskDto>>(completedTasks)
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
                tasks = DefaultTasks.Where(t => t.AssigneeID == userId && t.TaskClassID == "TC009" && !t.IsDeleted).ToList();
            }
        }
        else
        {
            tasks = DefaultTasks.Where(t => t.AssigneeID == userId && t.TaskClassID == "TC009" && !t.IsDeleted).ToList();
        }

        var totalDays = tasks.Sum(t => t.TravelDuration ?? 0);

        // 手动映射以处理 Participants JSON
        var taskDtos = tasks.Select(t =>
        {
            var dto = _mapper.Map<TaskDto>(t);
            dto.Participants = ParseJsonList(t.Participants);
            dto.ParticipantNames = ParseJsonList(t.ParticipantNames);
            return dto;
        }).ToList();

        return new TravelTasksResponse
        {
            Tasks = taskDtos,
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
                tasks = DefaultTasks.Where(t => t.AssigneeID == userId && t.TaskClassID == "TC007" && !t.IsDeleted).ToList();
            }
        }
        else
        {
            tasks = DefaultTasks.Where(t => t.AssigneeID == userId && t.TaskClassID == "TC007" && !t.IsDeleted).ToList();
        }

        var totalHours = tasks.Sum(t => t.MeetingDuration ?? 0);

        // 手动映射以处理 Participants JSON
        var taskDtos = tasks.Select(t =>
        {
            var dto = _mapper.Map<TaskDto>(t);
            dto.Participants = ParseJsonList(t.Participants);
            dto.ParticipantNames = ParseJsonList(t.ParticipantNames);
            return dto;
        }).ToList();

        return new MeetingTasksResponse
        {
            Tasks = taskDtos,
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
