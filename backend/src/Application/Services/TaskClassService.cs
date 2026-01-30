using TaskManageSystem.Application.DTOs.TaskClasses;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Repositories;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 任务类别服务实现
/// </summary>
public class TaskClassService : ITaskClassService
{
    private readonly ITaskClassRepository? _taskClassRepository;
    private static readonly Dictionary<string, List<string>> CategoryConfigs = new()
    {
        // 使用驼峰命名，与 taskClass.code 保持一致
        ["Market"] = new List<string> { "标书", "复询", "技术支持", "其他" },
        ["Execution"] = new List<string> { "搭建生产资料", "设计院提资", "CT配合与提资", "随机资料", "项目特殊项处理", "用户配合", "图纸会签", "传真回复", "其他" },
        ["Nuclear"] = new List<string> { "核电设计", "核安全审评", "设备调试", "常规岛配合", "核岛接口", "技术支持", "其他" },
        ["ProductDev"] = new List<string> { "技术支持", "设计流程", "方案评审", "专利申请", "出图", "图纸改版", "设计总结" },
        ["Research"] = new List<string> { "开题报告", "专利申请", "结题报告", "其他" },
        ["Renovation"] = new List<string> { "前期项目配合", "方案编制", "其他" },
        ["MeetingTraining"] = new List<string> { "学习与培训", "党建会议", "班务会", "设计评审会", "资料讨论会", "其他" },
        ["AdminParty"] = new List<string> { "报表填报", "ppt汇报", "总结报告", "其他" },
        ["Travel"] = new List<string> { "市场配合出差", "常规项目执行出差", "核电项目执行出差", "科研出差", "改造服务出差", "其他任务出差" },
        ["Other"] = new List<string> { "通用任务" }
    };

    // 默认任务类别列表（内存数据）
    private static readonly List<TaskClassDto> DefaultTaskClasses = new()
    {
        new TaskClassDto { Id = "TC001", Name = "市场配合", Code = "Market", Description = "市场配合相关任务" },
        new TaskClassDto { Id = "TC002", Name = "常规项目执行", Code = "Execution", Description = "常规项目执行相关任务" },
        new TaskClassDto { Id = "TC003", Name = "核电项目执行", Code = "Nuclear", Description = "核电项目执行相关任务" },
        new TaskClassDto { Id = "TC004", Name = "产品研发", Code = "ProductDev", Description = "产品研发相关任务" },
        new TaskClassDto { Id = "TC005", Name = "科研任务", Code = "Research", Description = "科研项目相关任务" },
        new TaskClassDto { Id = "TC006", Name = "改造服务", Code = "Renovation", Description = "改造服务相关任务" },
        new TaskClassDto { Id = "TC007", Name = "内部会议与培训", Code = "MeetingTraining", Description = "会议和培训任务" },
        new TaskClassDto { Id = "TC008", Name = "行政与党建", Code = "AdminParty", Description = "行政和党建任务" },
        new TaskClassDto { Id = "TC009", Name = "差旅任务", Code = "Travel", Description = "出差任务" },
        new TaskClassDto { Id = "TC010", Name = "其他任务", Code = "Other", Description = "其他类型任务" }
    };

    public TaskClassService(ITaskClassRepository? taskClassRepository = null)
    {
        _taskClassRepository = taskClassRepository;
    }

    public async Task<TaskClassListResponse> GetTaskClassesAsync(bool includeDeleted = false)
    {
        List<TaskClassDto> taskClasses;

        // 尝试从数据库获取，如果不可用则使用内存数据
        if (_taskClassRepository != null)
        {
            try
            {
                var dbTaskClasses = await _taskClassRepository.GetAllAsync();
                taskClasses = dbTaskClasses.Select(tc => new TaskClassDto
                {
                    Id = tc.Id,
                    Name = tc.Name,
                    Code = tc.Code.ToString(),
                    Description = tc.Description,
                    Notice = tc.Notice
                }).ToList();
            }
            catch
            {
                // 数据库不可用，使用内存数据
                taskClasses = DefaultTaskClasses;
            }
        }
        else
        {
            taskClasses = DefaultTaskClasses;
        }

        return new TaskClassListResponse
        {
            TaskClasses = taskClasses,
            Categories = CategoryConfigs
        };
    }

    public async Task<TaskClassDto?> GetTaskClassByIdAsync(string id)
    {
        // 先从默认列表查找
        var defaultClass = DefaultTaskClasses.FirstOrDefault(tc => tc.Id == id);
        if (defaultClass != null)
        {
            return defaultClass;
        }

        if (_taskClassRepository == null) return null;

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
        if (!Enum.TryParse<TaskClassCode>(request.Code, true, out var code))
        {
            throw new ArgumentException($"Invalid task class code: {request.Code}");
        }

        if (_taskClassRepository == null)
        {
            // 使用内存数据
            var newClass = new TaskClassDto
            {
                Id = request.Id ?? $"TC{(DefaultTaskClasses.Count + 1):D3}",
                Name = request.Name,
                Code = code.ToString(),
                Description = request.Description,
                Notice = request.Notice
            };
            DefaultTaskClasses.Add(newClass);

            if (request.Categories != null && request.Categories.Any())
            {
                CategoryConfigs[request.Code] = request.Categories;
            }

            return newClass;
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
        var taskClass = await GetTaskClassEntityByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        if (!string.IsNullOrEmpty(request.Name))
        {
            taskClass.Name = request.Name;
            // 更新内存数据
            var memClass = DefaultTaskClasses.FirstOrDefault(tc => tc.Id == id);
            if (memClass != null) memClass.Name = request.Name;
        }
        if (!string.IsNullOrEmpty(request.Description))
        {
            taskClass.Description = request.Description;
            var memClass = DefaultTaskClasses.FirstOrDefault(tc => tc.Id == id);
            if (memClass != null) memClass.Description = request.Description;
        }
        if (request.Notice != null)
        {
            taskClass.Notice = request.Notice;
            var memClass = DefaultTaskClasses.FirstOrDefault(tc => tc.Id == id);
            if (memClass != null) memClass.Notice = request.Notice;
        }

        if (_taskClassRepository != null)
        {
            taskClass = await _taskClassRepository.UpdateAsync(taskClass);
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

    public async Task<bool> SoftDeleteTaskClassAsync(string id)
    {
        if (_taskClassRepository == null)
        {
            // 从内存列表移除
            var removed = DefaultTaskClasses.RemoveAll(tc => tc.Id == id);
            return removed > 0;
        }

        return await _taskClassRepository.SoftDeleteAsync(id);
    }

    public async Task<TaskClassUsageResponse> CheckUsageAsync(string id)
    {
        var taskClass = await GetTaskClassEntityByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        int taskCount = 0;
        if (_taskClassRepository != null)
        {
            taskCount = await _taskClassRepository.CountTasksByClassIdAsync(id);
        }

        return new TaskClassUsageResponse
        {
            HasTasks = taskCount > 0,
            TaskCount = taskCount,
            TaskClassCode = taskClass.Code.ToString()
        };
    }

    public async Task AddCategoryAsync(string id, string category)
    {
        var taskClass = await GetTaskClassEntityByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        var code = taskClass.Code.ToString();
        if (!CategoryConfigs.ContainsKey(code))
            CategoryConfigs[code] = new List<string>();

        if (!CategoryConfigs[code].Contains(category))
            CategoryConfigs[code].Add(category);
    }

    public async Task RemoveCategoryAsync(string id, string categoryName)
    {
        var taskClass = await GetTaskClassEntityByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        var code = taskClass.Code.ToString();
        if (CategoryConfigs.ContainsKey(code))
            CategoryConfigs[code].Remove(categoryName);
    }

    public async Task UpdateCategoryNameAsync(string id, string oldName, string newName)
    {
        var taskClass = await GetTaskClassEntityByIdAsync(id);
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
        var taskClass = await GetTaskClassEntityByIdAsync(id);
        if (taskClass == null) throw new KeyNotFoundException($"TaskClass {id} not found");

        var code = taskClass.Code.ToString();
        if (CategoryConfigs.ContainsKey(code))
            CategoryConfigs[code] = newOrder;
    }

    public async Task UpdateCategoriesAsync(string code, List<string> categories)
    {
        if (Enum.TryParse<TaskClassCode>(code, true, out var classCode))
        {
            CategoryConfigs[classCode.ToString()] = categories;
        }
    }

    // 辅助方法：获取任务类别实体
    private async Task<TaskClass?> GetTaskClassEntityByIdAsync(string id)
    {
        // 先从默认列表查找
        var defaultClass = DefaultTaskClasses.FirstOrDefault(tc => tc.Id == id);
        if (defaultClass != null)
        {
            return new TaskClass
            {
                Id = defaultClass.Id,
                Name = defaultClass.Name,
                Code = Enum.Parse<TaskClassCode>(defaultClass.Code),
                Description = defaultClass.Description,
                Notice = defaultClass.Notice
            };
        }

        if (_taskClassRepository == null) return null;

        return await _taskClassRepository.GetByIdAsync(id);
    }
}
