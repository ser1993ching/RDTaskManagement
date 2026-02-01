using System.Text.Json;
using Microsoft.Extensions.Logging;
using TaskManageSystem.Application.DTOs.Settings;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 系统配置服务实现 - 使用数据库持久化存储
/// </summary>
public class SettingsService : ISettingsService
{
    private readonly ISystemConfigRepository _configRepository;
    private readonly ILogger<SettingsService> _logger;

    // 内存缓存 - 避免频繁数据库查询
    private static readonly Dictionary<string, object> _memoryCache = new();
    private static readonly object _cacheLock = new();

    // 默认配置值
    private static readonly List<string> DefaultEquipmentModels = new()
    {
        "H300", "H380", "H420", "H480", "H550", "H620", "H700", "H800", "H900", "H1000"
    };

    private static readonly List<string> DefaultCapacityLevels = new()
    {
        "100MW", "150MW", "200MW", "250MW", "300MW", "350MW", "400MW", "500MW", "600MW", "700MW"
    };

    private static readonly List<string> DefaultTravelLabels = new()
    {
        "市场配合出差", "常规项目执行出差", "核电项目执行出差", "科研出差", "改造服务出差", "其他任务出差"
    };

    private static readonly Dictionary<string, List<string>> DefaultTaskCategories = new()
    {
        ["Market"] = new List<string> { "标书", "复询", "技术方案", "其他" },
        ["Execution"] = new List<string> { "搭建生产资料", "设计院提资", "CT配合与提资", "随机资料", "项目特殊项处理", "用户配合", "图纸会签", "传真回复", "其他" },
        ["Nuclear"] = new List<string> { "核电设计", "核安全审查", "设备调试", "常规岛配合", "核岛接口", "技术方案", "其他" },
        ["ProductDev"] = new List<string> { "技术方案", "设计流程", "方案评审", "专利申请", "出图", "图纸改版", "设计总结" },
        ["Research"] = new List<string> { "开题报告", "专利申请", "结题报告", "其他" },
        ["Renovation"] = new List<string> { "前期项目配合", "方案编制", "其他" },
        ["MeetingTraining"] = new List<string> { "学习与培训", "党建会议", "班务会", "设计评审会", "资料讨论会", "其他" },
        ["AdminParty"] = new List<string> { "报表填报", "ppt汇报", "总结报告", "其他" },
        ["Travel"] = new List<string> { "市场配合出差", "常规项目执行出差", "核电项目执行出差", "科研出差", "改造服务出差", "其他任务出差" },
        ["Other"] = new List<string> { "通用任务" }
    };

    // 分类标签缓存（Dictionary<"taskClassCode|categoryName", List<string>>）
    private static readonly Dictionary<string, List<string>> _categoryLabelsCache = new();
    private static readonly object _categoryLabelsLock = new();

    public SettingsService(ISystemConfigRepository configRepository, ILogger<SettingsService> logger)
    {
        _configRepository = configRepository;
        _logger = logger;
    }

    /// <summary>
    /// 初始化默认配置值（首次运行时）
    /// </summary>
    public async Task InitializeDefaultValuesAsync()
    {
        try
        {
            // 初始化机型配置
            await InitializeConfigCategoryAsync("EquipmentModels", JsonSerializer.Serialize(DefaultEquipmentModels));

            // 初始化容量等级配置
            await InitializeConfigCategoryAsync("CapacityLevels", JsonSerializer.Serialize(DefaultCapacityLevels));

            // 初始化差旅标签配置
            await InitializeConfigCategoryAsync("TravelLabels", JsonSerializer.Serialize(DefaultTravelLabels));

            // 初始化任务分类配置
            await InitializeTaskCategoriesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "初始化默认配置值失败");
        }
    }

    private async Task InitializeConfigCategoryAsync(string category, string defaultValue)
    {
        var exists = await _configRepository.ConfigExistsAsync(category, category);
        if (!exists)
        {
            await _configRepository.SaveConfigValueAsync(category, category, defaultValue);
        }
    }

    private async Task InitializeTaskCategoriesAsync()
    {
        var exists = await _configRepository.ConfigExistsAsync("TaskCategories", "All");
        if (!exists)
        {
            await _configRepository.SaveConfigValueAsync("TaskCategories", "All", JsonSerializer.Serialize(DefaultTaskCategories));
        }
    }

    /// <summary>
    /// 从数据库或缓存获取配置
    /// </summary>
    private async Task<List<T>> GetListConfigAsync<T>(string category)
    {
        var cacheKey = $"List_{category}";

        // 先从缓存获取
        lock (_cacheLock)
        {
            if (_memoryCache.TryGetValue(cacheKey, out var cached) && cached is List<T> cachedList)
            {
                return cachedList;
            }
        }

        // 从数据库获取
        var configValue = await _configRepository.GetConfigValueAsync(category, category);

        List<T> result;
        if (configValue != null)
        {
            result = JsonSerializer.Deserialize<List<T>>(configValue) ?? new List<T>();
        }
        else
        {
            result = new List<T>();
        }

        // 更新缓存
        lock (_cacheLock)
        {
            _memoryCache[cacheKey] = result;
        }

        return result;
    }

    /// <summary>
    /// 从数据库或缓存获取字典配置
    /// </summary>
    private async Task<Dictionary<string, List<T>>> GetDictConfigAsync<T>(string category)
    {
        var cacheKey = $"Dict_{category}";

        // 先从缓存获取
        lock (_cacheLock)
        {
            if (_memoryCache.TryGetValue(cacheKey, out var cached) && cached is Dictionary<string, List<T>> cachedDict)
            {
                return cachedDict;
            }
        }

        // 从数据库获取
        var configValue = category == "TaskCategories"
            ? await _configRepository.GetConfigValueAsync(category, "All")
            : await _configRepository.GetConfigValueAsync(category, category);

        Dictionary<string, List<T>> result;
        if (configValue != null)
        {
            result = JsonSerializer.Deserialize<Dictionary<string, List<T>>>(configValue)
                     ?? new Dictionary<string, List<T>>();
        }
        else
        {
            result = new Dictionary<string, List<T>>();
        }

        // 更新缓存
        lock (_cacheLock)
        {
            _memoryCache[cacheKey] = result;
        }

        return result;
    }

    /// <summary>
    /// 保存配置到数据库
    /// </summary>
    private async Task SaveConfigAsync<T>(string category, string key, T value)
    {
        var configKey = category == "TaskCategories" ? "All" : key;
        await _configRepository.SaveConfigValueAsync(category, configKey, JsonSerializer.Serialize(value));

        // 更新缓存
        var cacheKey = category.StartsWith("TaskCategories") ? $"Dict_{category}" : $"List_{category}";
        lock (_cacheLock)
        {
            _memoryCache.Remove(cacheKey);
        }
    }

    #region 机型管理

    public async Task<EquipmentModelsResponse> GetEquipmentModelsAsync()
    {
        var models = await GetListConfigAsync<string>("EquipmentModels");
        return new EquipmentModelsResponse { Models = models };
    }

    public async Task<SettingsApiResponse<object>> AddEquipmentModelAsync(AddEquipmentModelRequest request)
    {
        var models = await GetListConfigAsync<string>("EquipmentModels");
        if (models.Contains(request.Model))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "机型已存在"
            };
        }

        models.Add(request.Model);
        models.Sort();
        await SaveConfigAsync("EquipmentModels", "EquipmentModels", models);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "添加成功"
        };
    }

    public async Task<SettingsApiResponse<object>> DeleteEquipmentModelAsync(string model)
    {
        var models = await GetListConfigAsync<string>("EquipmentModels");
        if (!models.Remove(model))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "机型不存在"
            };
        }

        await SaveConfigAsync("EquipmentModels", "EquipmentModels", models);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "删除成功"
        };
    }

    public async Task<SettingsApiResponse<object>> BatchAddEquipmentModelsAsync(BatchAddEquipmentModelsRequest request)
    {
        var models = await GetListConfigAsync<string>("EquipmentModels");
        var addedCount = 0;

        foreach (var model in request.Models)
        {
            if (!models.Contains(model))
            {
                models.Add(model);
                addedCount++;
            }
        }

        models.Sort();
        await SaveConfigAsync("EquipmentModels", "EquipmentModels", models);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Data = addedCount,
            Message = $"成功添加 {addedCount} 个机型"
        };
    }

    #endregion

    #region 容量等级管理

    public async Task<CapacityLevelsResponse> GetCapacityLevelsAsync()
    {
        var levels = await GetListConfigAsync<string>("CapacityLevels");
        return new CapacityLevelsResponse { Levels = levels };
    }

    public async Task<SettingsApiResponse<object>> AddCapacityLevelAsync(AddCapacityLevelRequest request)
    {
        var levels = await GetListConfigAsync<string>("CapacityLevels");
        if (levels.Contains(request.Level))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "容量等级已存在"
            };
        }

        levels.Add(request.Level);
        levels.Sort();
        await SaveConfigAsync("CapacityLevels", "CapacityLevels", levels);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "添加成功"
        };
    }

    public async Task<SettingsApiResponse<object>> DeleteCapacityLevelAsync(string level)
    {
        var levels = await GetListConfigAsync<string>("CapacityLevels");
        if (!levels.Remove(level))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "容量等级不存在"
            };
        }

        await SaveConfigAsync("CapacityLevels", "CapacityLevels", levels);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "删除成功"
        };
    }

    #endregion

    #region 差旅标签管理

    public async Task<TravelLabelsResponse> GetTravelLabelsAsync()
    {
        var labels = await GetListConfigAsync<string>("TravelLabels");
        return new TravelLabelsResponse { Labels = labels };
    }

    public async Task<SettingsApiResponse<object>> AddTravelLabelAsync(AddTravelLabelRequest request)
    {
        var labels = await GetListConfigAsync<string>("TravelLabels");
        if (labels.Contains(request.Label))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "差旅标签已存在"
            };
        }

        labels.Add(request.Label);
        labels.Sort();
        await SaveConfigAsync("TravelLabels", "TravelLabels", labels);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "添加成功"
        };
    }

    public async Task<SettingsApiResponse<object>> DeleteTravelLabelAsync(string label)
    {
        var labels = await GetListConfigAsync<string>("TravelLabels");
        if (!labels.Remove(label))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "差旅标签不存在"
            };
        }

        await SaveConfigAsync("TravelLabels", "TravelLabels", labels);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "删除成功"
        };
    }

    #endregion

    #region 用户头像管理

    public async Task<UserAvatarResponse?> GetUserAvatarAsync(string userId)
    {
        var avatars = await GetDictConfigAsync<string>("UserAvatars");
        if (avatars.TryGetValue(userId, out var avatar) && avatar.Count > 0)
        {
            return new UserAvatarResponse
            {
                UserId = userId,
                Avatar = avatar[0]
            };
        }

        return null;
    }

    public async Task<SettingsApiResponse<object>> SaveUserAvatarAsync(string userId, SaveUserAvatarRequest request)
    {
        var avatars = await GetDictConfigAsync<string>("UserAvatars");
        if (!avatars.ContainsKey(userId))
        {
            avatars[userId] = new List<string>();
        }
        avatars[userId][0] = request.Avatar;

        await SaveConfigAsync("UserAvatars", "UserAvatars", avatars);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "头像保存成功"
        };
    }

    public async Task<SettingsApiResponse<object>> DeleteUserAvatarAsync(string userId)
    {
        var avatars = await GetDictConfigAsync<string>("UserAvatars");
        if (!avatars.ContainsKey(userId) || !avatars.Remove(userId))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "用户头像不存在"
            };
        }

        await SaveConfigAsync("UserAvatars", "UserAvatars", avatars);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "头像删除成功"
        };
    }

    #endregion

    #region 任务分类管理

    public async Task<TaskCategoriesResponse> GetTaskCategoriesAsync()
    {
        var categories = await GetDictConfigAsync<string>("TaskCategories");
        return new TaskCategoriesResponse { Categories = categories };
    }

    public async Task<SettingsApiResponse<object>> UpdateTaskCategoriesAsync(string code, UpdateTaskCategoriesRequest request)
    {
        var categories = await GetDictConfigAsync<string>("TaskCategories");
        categories[code] = request.Categories;

        await SaveConfigAsync("TaskCategories", "All", categories);

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "更新成功"
        };
    }

    #endregion

    #region 分类标签管理（差旅任务子分类标签）

    /// <summary>
    /// 获取分类标签（带缓存）
    /// </summary>
    public async Task<CategoryLabelsResponse> GetCategoryLabelsAsync(string taskClassCode, string categoryName)
    {
        var cacheKey = $"{taskClassCode}|{categoryName}";

        // 先从缓存获取
        lock (_categoryLabelsLock)
        {
            if (_categoryLabelsCache.TryGetValue(cacheKey, out var cached) && cached is List<string> cachedList)
            {
                return new CategoryLabelsResponse { Labels = cachedList };
            }
        }

        // 从数据库获取
        var allLabels = await GetDictConfigAsync<string>("CategoryLabels");
        var labels = new List<string>();

        if (allLabels.TryGetValue(cacheKey, out var storedLabels))
        {
            labels = storedLabels;
        }

        // 更新缓存
        lock (_categoryLabelsLock)
        {
            _categoryLabelsCache[cacheKey] = labels;
        }

        return new CategoryLabelsResponse { Labels = labels };
    }

    /// <summary>
    /// 更新分类标签
    /// </summary>
    public async Task<SettingsApiResponse<object>> UpdateCategoryLabelsAsync(string taskClassCode, string categoryName, UpdateCategoryLabelsRequest request)
    {
        var cacheKey = $"{taskClassCode}|{categoryName}";
        var allLabels = await GetDictConfigAsync<string>("CategoryLabels");

        allLabels[cacheKey] = request.Labels;

        await SaveConfigAsync("CategoryLabels", "All", allLabels);

        // 更新缓存
        lock (_categoryLabelsLock)
        {
            _categoryLabelsCache[cacheKey] = request.Labels;
        }

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "标签更新成功"
        };
    }

    /// <summary>
    /// 添加分类标签
    /// </summary>
    public async Task<SettingsApiResponse<object>> AddCategoryLabelAsync(string taskClassCode, string categoryName, AddCategoryLabelRequest request)
    {
        var cacheKey = $"{taskClassCode}|{categoryName}";
        var allLabels = await GetDictConfigAsync<string>("CategoryLabels");

        if (!allLabels.TryGetValue(cacheKey, out var labels))
        {
            labels = new List<string>();
        }

        if (labels.Contains(request.Label))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "标签已存在"
            };
        }

        labels.Add(request.Label);
        allLabels[cacheKey] = labels;

        await SaveConfigAsync("CategoryLabels", "All", allLabels);

        // 更新缓存
        lock (_categoryLabelsLock)
        {
            _categoryLabelsCache[cacheKey] = labels;
        }

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "标签添加成功"
        };
    }

    /// <summary>
    /// 删除分类标签
    /// </summary>
    public async Task<SettingsApiResponse<object>> DeleteCategoryLabelAsync(string taskClassCode, string categoryName, string label)
    {
        var cacheKey = $"{taskClassCode}|{categoryName}";
        var allLabels = await GetDictConfigAsync<string>("CategoryLabels");

        if (!allLabels.TryGetValue(cacheKey, out var labels) || !labels.Remove(label))
        {
            return new SettingsApiResponse<object>
            {
                Success = false,
                Error = "标签不存在"
            };
        }

        await SaveConfigAsync("CategoryLabels", "All", allLabels);

        // 更新缓存
        lock (_categoryLabelsLock)
        {
            _categoryLabelsCache[cacheKey] = labels;
        }

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "标签删除成功"
        };
    }

    #endregion

    #region 数据管理

    public async Task<SettingsApiResponse<object>> ResetAllDataAsync()
    {
        // 重置机型
        await SaveConfigAsync("EquipmentModels", "EquipmentModels", DefaultEquipmentModels);

        // 重置容量等级
        await SaveConfigAsync("CapacityLevels", "CapacityLevels", DefaultCapacityLevels);

        // 重置差旅标签
        await SaveConfigAsync("TravelLabels", "TravelLabels", DefaultTravelLabels);

        // 重置任务分类
        await SaveConfigAsync("TaskCategories", "All", DefaultTaskCategories);

        // 清除用户头像
        await SaveConfigAsync("UserAvatars", "UserAvatars", new Dictionary<string, List<string>>());

        // 清除分类标签
        await SaveConfigAsync("CategoryLabels", "All", new Dictionary<string, List<string>>());

        // 清除缓存
        lock (_cacheLock)
        {
            _memoryCache.Clear();
        }
        lock (_categoryLabelsLock)
        {
            _categoryLabelsCache.Clear();
        }

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "所有配置数据已重置"
        };
    }

    public async Task<SettingsApiResponse<object>> RefreshTasksAsync()
    {
        // 清除缓存，触发重新加载
        lock (_cacheLock)
        {
            _memoryCache.Clear();
        }

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "配置数据已刷新"
        };
    }

    public async Task<SettingsApiResponse<object>> MigrateDataAsync()
    {
        // 数据迁移 - 确保所有配置都已初始化
        await InitializeDefaultValuesAsync();

        return new SettingsApiResponse<object>
        {
            Success = true,
            Message = "数据迁移完成"
        };
    }

    #endregion
}
