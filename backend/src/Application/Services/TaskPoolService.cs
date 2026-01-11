using AutoMapper;
using TaskManageSystem.Application.DTOs.TaskPool;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Infrastructure.Repositories;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 任务库服务实�?
/// </summary>
public class TaskPoolService : ITaskPoolService
{
    private readonly ITaskPoolRepository _taskPoolRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly IMapper _mapper;

    public TaskPoolService(ITaskPoolRepository taskPoolRepository, ITaskRepository taskRepository, IMapper mapper)
    {
        _taskPoolRepository = taskPoolRepository;
        _taskRepository = taskRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResponse<TaskPoolItemDto>> GetPoolItemsAsync(TaskPoolQueryParams query)
    {
        var items = await _taskPoolRepository.GetAllAsync();

        // 过滤
        if (!string.IsNullOrEmpty(query.TaskClassID))
            items = items.Where(tp => tp.TaskClassID == query.TaskClassID);

        if (!string.IsNullOrEmpty(query.Category))
            items = items.Where(tp => tp.Category == query.Category);

        if (!string.IsNullOrEmpty(query.ProjectID))
            items = items.Where(tp => tp.ProjectID == query.ProjectID);

        var total = items.Count();
        var pages = (int)Math.Ceiling(total / (double)query.PageSize);

        items = items.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize);

        return new PaginatedResponse<TaskPoolItemDto>
        {
            Data = _mapper.Map<List<TaskPoolItemDto>>(items),
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize,
            Pages = pages
        };
    }

    public async Task<TaskPoolItemDto?> GetPoolItemByIdAsync(string id)
    {
        var item = await _taskPoolRepository.GetByIdAsync(id);
        return item == null ? null : _mapper.Map<TaskPoolItemDto>(item);
    }

    public async Task<TaskPoolItemDto> CreatePoolItemAsync(CreateTaskPoolItemRequest request)
    {
        var item = _mapper.Map<TaskPoolItem>(request);

        // 生成ID
        item.Id = $"TP-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";
        item.CreatedDate = DateTime.UtcNow;

        item = await _taskPoolRepository.CreateAsync(item);
        return _mapper.Map<TaskPoolItemDto>(item);
    }

    public async Task<TaskPoolItemDto> UpdatePoolItemAsync(string id, CreateTaskPoolItemRequest request)
    {
        var item = await _taskPoolRepository.GetByIdAsync(id);
        if (item == null) throw new KeyNotFoundException($"TaskPoolItem {id} not found");

        _mapper.Map(request, item);
        item = await _taskPoolRepository.UpdateAsync(item);
        return _mapper.Map<TaskPoolItemDto>(item);
    }

    public async Task<bool> SoftDeletePoolItemAsync(string id)
    {
        return await _taskPoolRepository.SoftDeleteAsync(id);
    }

    public async Task<AssignTaskResponse> AssignTaskAsync(string poolItemId, AssignTaskRequest request)
    {
        var poolItem = await _taskPoolRepository.GetByIdAsync(poolItemId);
        if (poolItem == null)
        {
            return new AssignTaskResponse { Success = false, Message = "计划任务不存�? };
        }

        // 创建新任�?
        var task = new TaskEntity
        {
            TaskID = $"T-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}",
            TaskName = poolItem.TaskName,
            TaskClassID = poolItem.TaskClassID,
            Category = poolItem.Category,
            ProjectID = poolItem.ProjectID,
            AssigneeID = request.AssigneeId,
            AssigneeName = request.AssigneeName,
            StartDate = request.StartDate ?? poolItem.StartDate,
            DueDate = request.DueDate ?? poolItem.DueDate,
            CreatedBy = poolItem.CreatedBy,
            CreatedDate = DateTime.UtcNow,
            Status = Domain.Enums.TaskStatus.NotStarted,
            CheckerID = poolItem.CheckerID,
            ChiefDesignerID = poolItem.ChiefDesignerID,
            ApproverID = poolItem.ApproverID,
            IsForceAssessment = poolItem.IsForceAssessment
        };

        await _taskRepository.CreateAsync(task);

        // 软删除计划任�?
        await _taskPoolRepository.SoftDeleteAsync(poolItemId);

        return new AssignTaskResponse
        {
            Success = true,
            TaskId = task.TaskID,
            TaskPoolItemId = poolItemId,
            Message = "任务分配成功"
        };
    }

    public async Task<BatchAssignResponse> BatchAssignAsync(BatchAssignRequest request)
    {
        var taskIds = new List<string>();
        var assignedCount = 0;
        var failedCount = 0;

        foreach (var poolItemId in request.PoolItemIds)
        {
            var assignRequest = new AssignTaskRequest
            {
                AssignToPoolItemId = poolItemId,
                AssigneeId = request.AssigneeId,
                StartDate = request.StartDate,
                DueDate = request.DueDate
            };

            var result = await AssignTaskAsync(poolItemId, assignRequest);
            if (result.Success)
            {
                assignedCount++;
                taskIds.Add(result.TaskId);
            }
            else
            {
                failedCount++;
            }
        }

        return new BatchAssignResponse
        {
            Success = failedCount == 0,
            AssignedCount = assignedCount,
            FailedCount = failedCount,
            TaskIds = taskIds,
            Message = $"成功分配 {assignedCount} 个任务，失败 {failedCount} �?
        };
    }

    public async Task<TaskPoolStatisticsResponse> GetStatisticsAsync()
    {
        var (total, byCategory, byProject, pending, assigned) = await _taskPoolRepository.GetStatisticsAsync();

        return new TaskPoolStatisticsResponse
        {
            Total = total,
            ByCategory = byCategory,
            ByProject = byProject,
            Pending = pending,
            Assigned = assigned
        };
    }

    public async Task<TaskPoolItemDto> DuplicateAsync(string id, string? newTaskName, DateTime? newDueDate)
    {
        var original = await _taskPoolRepository.GetByIdAsync(id);
        if (original == null) throw new KeyNotFoundException($"TaskPoolItem {id} not found");

        var duplicate = new TaskPoolItem
        {
            TaskName = newTaskName ?? $"{original.TaskName} - 副本",
            TaskClassID = original.TaskClassID,
            Category = original.Category,
            ProjectID = original.ProjectID,
            ProjectName = original.ProjectName,
            PersonInChargeID = original.PersonInChargeID,
            PersonInChargeName = original.PersonInChargeName,
            CheckerID = original.CheckerID,
            ChiefDesignerID = original.ChiefDesignerID,
            ApproverID = original.ApproverID,
            StartDate = original.StartDate,
            DueDate = newDueDate ?? original.DueDate,
            CreatedBy = original.CreatedBy,
            CreatedByName = original.CreatedByName,
            CreatedDate = DateTime.UtcNow,
            IsForceAssessment = original.IsForceAssessment,
            Remark = original.Remark
        };

        duplicate.Id = $"TP-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";
        duplicate = await _taskPoolRepository.CreateAsync(duplicate);
        return _mapper.Map<TaskPoolItemDto>(duplicate);
    }

    public async Task<RetrieveToPoolResponse> RetrieveFromTaskAsync(string taskId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
        {
            return new RetrieveToPoolResponse { Success = false, Message = "任务不存�? };
        }

        // 创建计划任务
        var poolItem = new TaskPoolItem
        {
            TaskName = task.TaskName,
            TaskClassID = task.TaskClassID,
            Category = task.Category,
            ProjectID = task.ProjectID,
            PersonInChargeID = task.AssigneeID,
            PersonInChargeName = task.AssigneeName,
            CheckerID = task.CheckerID,
            ChiefDesignerID = task.ChiefDesignerID,
            ApproverID = task.ApproverID,
            StartDate = task.StartDate,
            DueDate = task.DueDate,
            CreatedBy = task.CreatedBy,
            CreatedDate = DateTime.UtcNow,
            IsForceAssessment = task.IsForceAssessment,
            Remark = task.Remark
        };

        poolItem.Id = $"TP-{DateTime.UtcNow:yyyyMMdd}-{DateTime.UtcNow:HHmmss}";
        await _taskPoolRepository.CreateAsync(poolItem);

        // 删除原任�?
        await _taskRepository.SoftDeleteAsync(taskId);

        return new RetrieveToPoolResponse
        {
            Success = true,
            PoolItemId = poolItem.Id,
            Message = "已回收至任务�?
        };
    }
}

// 使用别名避免与Domain.Task冲突
using TaskEntity = TaskManageSystem.Domain.Entities.Task;
