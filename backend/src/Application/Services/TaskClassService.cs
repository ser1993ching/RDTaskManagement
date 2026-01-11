using TaskManageSystem.Application.DTOs.TaskClasses;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Repositories;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 任务类别服务实现
/// </summary>
public class TaskClassService : ITaskClassService
{
    private readonly ITaskClassRepository _taskClassRepository;
    private static readonly Dictionary<string, List<string>> CategoryConfigs = new()
    {
        ["MARKET"] = new List<string> { "标书", "复询", "技术支持", "其他" },
        ["EXECUTION"] = new List<string> { "搭建生产资料", "设计院提资", "CT配合与提资", "随机资料", "项目特殊项处理", "用户配合", "图纸会签", "传真回复", "其他" },
        ["NUCLEAR"] = new List<string> { "核电设计", "核安全审评", "设备调试", "常规岛配合", "核岛接口", "技术支持", "其他" },
        ["PRODUCT_DEV"] = new List<string> { "技术支持", "设计流程", "方案评审", "专利申请", "出图", "图纸改版", "设计总结" },
        ["RESEARCH"] = new List<string> { "开题报告", "专利申请", "结题报告", "其他" },
        ["RENOVATION"] = new List<string> { "前期项目配合", "方案编制", "其他" },
        ["MEETING_TRAINING"] = new List<string> { "学习与培训", "党建会议", "班务会", "设计评审会", "资料讨论会", "其他" },
        ["ADMIN_PARTY"] = new List<string> { "报表填报", "ppt汇报", "总结报告", "其他" },
        ["TRAVEL"] = new List<string> { "市场配合出差", "常规项目执行出差", "核电项目执行出差", "科研出差", "改造服务出差", "其他任务出差" },
        ["OTHER"] = new List<string> { "通用任务" }
    };

    public TaskClassService(ITaskClassRepository taskClassRepository)
    {
        _taskClassRepository = taskClassRepository;
    }

    public async Task<TaskClassListResponse> GetTaskClassesAsync(bool includeDeleted = false)
    {
        var taskClasses = await _taskClassRepository.GetAllAsync();

        return new TaskClassListResponse
        {
            TaskClasses = taskClasses.Select(tc => new TaskClassDto
            {
                Id = tc.Id,
                Name = tc.Name,
                Code = tc.Code.ToString(),
                Description = tc.Description,
                Notice = tc.Notice
            }).ToList(),
            Categories = CategoryConfigs
        };
    }

    public async Task<TaskClassDto?> GetTaskClassByIdAsync(string id)
    {
        var taskClass = await _taskClassRepository.GetByIdAsync(id);
        if (taskClass == null) return null;

        return new TaskClassDto
        {
            Id = taskClass.Id,
            Name = taskClass.Name,
            Code = taskClass.Code.ToString(),
            Description = taskClass.Description,
            Notice = taskClass.Notice
        };
    }

    public async Task<TaskClassDto> CreateTaskClassAsync(CreateTaskClassRequest request)
    {
        if (!Enum.TryParse<Domain.Enums.TaskClassCode>(request.Code, true, out var code))
        {
            throw new ArgumentException($"Invalid task class code: {request.Code}");
        }

        var taskClass = new TaskClass
        {
            Id = request.Id,
            Name = request.Name,
            Code = code,
            Description = request.Description,
            Notice = request.Notice
        };

        taskClass = await _taskClassRepository.CreateAsync(taskClass);

        // 初始化分类配置
        if (request.Categories != null && request.Categories.Any())
        {
            CategoryConfigs[request.Code] = request.Categories;
        }

        return new TaskClassDto
        {
            Id = taskClass.Id,
            Name = taskClass.Name,
            Code = taskClass.Code.ToString(),
            Description = taskClass.Description,
            Notice = taskClass.Notice
        };
    }

    public async Task<TaskClassDto> UpdateTaskClassAsync(string id, UpdateTaskClassRequest request)
    {
        var taskClass = await _taskClassRepository.GetByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        if (!string.IsNullOrEmpty(request.Name)) taskClass.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Description)) taskClass.Description = request.Description;
        if (request.Notice != null) taskClass.Notice = request.Notice;

        taskClass = await _taskClassRepository.UpdateAsync(taskClass);
        return new TaskClassDto
        {
            Id = taskClass.Id,
            Name = taskClass.Name,
            Code = taskClass.Code.ToString(),
            Description = taskClass.Description,
            Notice = taskClass.Notice
        };
    }

    public async Task<bool> SoftDeleteTaskClassAsync(string id)
    {
        return await _taskClassRepository.SoftDeleteAsync(id);
    }

    public async Task<TaskClassUsageResponse> CheckUsageAsync(string id)
    {
        var taskClass = await _taskClassRepository.GetByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        var taskCount = await _taskClassRepository.CountTasksByClassIdAsync(id);

        return new TaskClassUsageResponse
        {
            HasTasks = taskCount > 0,
            TaskCount = taskCount,
            TaskClassCode = taskClass.Code.ToString()
        };
    }

    public async Task AddCategoryAsync(string id, string category)
    {
        var taskClass = await _taskClassRepository.GetByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        var code = taskClass.Code.ToString();
        if (!CategoryConfigs.ContainsKey(code))
            CategoryConfigs[code] = new List<string>();

        if (!CategoryConfigs[code].Contains(category))
            CategoryConfigs[code].Add(category);
    }

    public async Task RemoveCategoryAsync(string id, string categoryName)
    {
        var taskClass = await _taskClassRepository.GetByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        var code = taskClass.Code.ToString();
        if (CategoryConfigs.ContainsKey(code))
            CategoryConfigs[code].Remove(categoryName);
    }

    public async Task UpdateCategoryNameAsync(string id, string oldName, string newName)
    {
        var taskClass = await _taskClassRepository.GetByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        var code = taskClass.Code.ToString();
        if (CategoryConfigs.ContainsKey(code))
        {
            var index = CategoryConfigs[code].IndexOf(oldName);
            if (index >= 0)
                CategoryConfigs[code][index] = newName;
        }
    }

    public async Task ReorderCategoriesAsync(string id, List<string> newOrder)
    {
        var taskClass = await _taskClassRepository.GetByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        var code = taskClass.Code.ToString();
        if (CategoryConfigs.ContainsKey(code))
            CategoryConfigs[code] = newOrder;
    }

    public async Task UpdateCategoriesAsync(string code, List<string> categories)
    {
        if (Enum.TryParse<Domain.Enums.TaskClassCode>(code, true, out var classCode))
        {
            CategoryConfigs[classCode.ToString()] = categories;
        }
    }
}
