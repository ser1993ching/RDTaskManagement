using TaskManageSystem.Application.DTOs.Settings;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Application.Services;

/// <summary>
/// 系统配置服务实现
/// </summary>
public class SettingsService : ISettingsService
{
    // 内存存储 - 实际项目中应使用数据库
    private static readonly List<string> EquipmentModels = new()
    {
        "H300", "H380", "H420", "H480", "H550",
        "H620", "H700", "H800", "H900", "H1000"
    };

    private static readonly List<string> CapacityLevels = new()
    {
        "100MW", "150MW", "200MW", "250MW", "300MW",
        "350MW", "400MW", "500MW", "600MW", "700MW"
    };

    private static readonly List<string> TravelLabels = new()
    {
        "市场配合出差", "常规项目执行出差", "核电项目执行出差",
        "科研出差", "改造服务出差", "其他任务出差"
    };

    private static readonly Dictionary<string, List<string>> TaskCategories = new()
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

    private static readonly Dictionary<string, string> UserAvatars = new();

    public Task<EquipmentModelsResponse> GetEquipmentModelsAsync()
    {
        return Task.FromResult(new EquipmentModelsResponse { Models = EquipmentModels });
    }

    public Task<SettingsApiResponse<object>> AddEquipmentModelAsync(AddEquipmentModelRequest request)
    {
        if (EquipmentModels.Contains(request.Model))
        {
            return Task.FromResult(new SettingsApiResponse<object>
            {
                Success = false,
                Error = "机型已存在"
            });
        }

        EquipmentModels.Add(request.Model);
        EquipmentModels.Sort();

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "添加成功"
        });
    }

    public Task<SettingsApiResponse<object>> DeleteEquipmentModelAsync(string model)
    {
        if (!EquipmentModels.Remove(model))
        {
            return Task.FromResult(new SettingsApiResponse<object>
            {
                Success = false,
                Error = "机型不存在"
            });
        }

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "删除成功"
        });
    }

    public Task<SettingsApiResponse<object>> BatchAddEquipmentModelsAsync(BatchAddEquipmentModelsRequest request)
    {
        var addedCount = 0;
        foreach (var model in request.Models)
        {
            if (!EquipmentModels.Contains(model))
            {
                EquipmentModels.Add(model);
                addedCount++;
            }
        }
        EquipmentModels.Sort();

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Data = addedCount,
            Message = $"成功添加 {addedCount} 个机型"
        });
    }

    public Task<CapacityLevelsResponse> GetCapacityLevelsAsync()
    {
        return Task.FromResult(new CapacityLevelsResponse { Levels = CapacityLevels });
    }

    public Task<SettingsApiResponse<object>> AddCapacityLevelAsync(AddCapacityLevelRequest request)
    {
        if (CapacityLevels.Contains(request.Level))
        {
            return Task.FromResult(new SettingsApiResponse<object>
            {
                Success = false,
                Error = "容量等级已存在"
            });
        }

        CapacityLevels.Add(request.Level);
        CapacityLevels.Sort();

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "添加成功"
        });
    }

    public Task<SettingsApiResponse<object>> DeleteCapacityLevelAsync(string level)
    {
        if (!CapacityLevels.Remove(level))
        {
            return Task.FromResult(new SettingsApiResponse<object>
            {
                Success = false,
                Error = "容量等级不存在"
            });
        }

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "删除成功"
        });
    }

    public Task<TravelLabelsResponse> GetTravelLabelsAsync()
    {
        return Task.FromResult(new TravelLabelsResponse { Labels = TravelLabels });
    }

    public Task<SettingsApiResponse<object>> AddTravelLabelAsync(AddTravelLabelRequest request)
    {
        if (TravelLabels.Contains(request.Label))
        {
            return Task.FromResult(new SettingsApiResponse<object>
            {
                Success = false,
                Error = "差旅标签已存在"
            });
        }

        TravelLabels.Add(request.Label);
        TravelLabels.Sort();

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "添加成功"
        });
    }

    public Task<SettingsApiResponse<object>> DeleteTravelLabelAsync(string label)
    {
        if (!TravelLabels.Remove(label))
        {
            return Task.FromResult(new SettingsApiResponse<object>
            {
                Success = false,
                Error = "差旅标签不存在"
            });
        }

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "删除成功"
        });
    }

    public Task<UserAvatarResponse?> GetUserAvatarAsync(string userId)
    {
        if (UserAvatars.TryGetValue(userId, out var avatar))
        {
            return Task.FromResult<UserAvatarResponse?>(new UserAvatarResponse
            {
                UserId = userId,
                Avatar = avatar
            });
        }

        return Task.FromResult<UserAvatarResponse?>(null);
    }

    public Task<SettingsApiResponse<object>> SaveUserAvatarAsync(string userId, SaveUserAvatarRequest request)
    {
        UserAvatars[userId] = request.Avatar;

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "头像保存成功"
        });
    }

    public Task<SettingsApiResponse<object>> DeleteUserAvatarAsync(string userId)
    {
        if (UserAvatars.Remove(userId))
        {
            return Task.FromResult(new SettingsApiResponse<object>
            {
                Success = true,
                Message = "头像删除成功"
            });
        }

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = false,
            Error = "用户头像不存在"
        });
    }

    public Task<TaskCategoriesResponse> GetTaskCategoriesAsync()
    {
        return Task.FromResult(new TaskCategoriesResponse { Categories = TaskCategories });
    }

    public Task<SettingsApiResponse<object>> UpdateTaskCategoriesAsync(string code, UpdateTaskCategoriesRequest request)
    {
        if (!TaskCategories.ContainsKey(code))
        {
            return Task.FromResult(new SettingsApiResponse<object>
            {
                Success = false,
                Error = "任务分类代码不存在"
            });
        }

        TaskCategories[code] = request.Categories;

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "更新成功"
        });
    }

    public Task<SettingsApiResponse<object>> ResetAllDataAsync()
    {
        // 重置所有配置数据
        EquipmentModels.Clear();
        EquipmentModels.AddRange(new[] { "H300", "H380", "H420", "H480", "H550", "H620", "H700", "H800", "H900", "H1000" });

        CapacityLevels.Clear();
        CapacityLevels.AddRange(new[] { "100MW", "150MW", "200MW", "250MW", "300MW", "350MW", "400MW", "500MW", "600MW", "700MW" });

        TravelLabels.Clear();
        TravelLabels.AddRange(new[] { "市场配合出差", "常规项目执行出差", "核电项目执行出差", "科研出差", "改造服务出差", "其他任务出差" });

        UserAvatars.Clear();

        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "所有配置数据已重置"
        });
    }

    public Task<SettingsApiResponse<object>> RefreshTasksAsync()
    {
        // 刷新任务数据 - 实际项目中可触发缓存刷新或数据同步
        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "任务数据已刷新"
        });
    }

    public Task<SettingsApiResponse<object>> MigrateDataAsync()
    {
        // 数据迁移 - 实际项目中可执行数据库迁移或数据转换
        return Task.FromResult(new SettingsApiResponse<object>
        {
            Success = true,
            Message = "数据迁移完成"
        });
    }
}
