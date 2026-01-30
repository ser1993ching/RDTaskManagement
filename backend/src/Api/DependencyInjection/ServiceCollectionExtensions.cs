using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Services;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;
using TaskManageSystem.Infrastructure.Data;
using TaskManageSystem.Infrastructure.Repositories;

namespace TaskManageSystem.Api.DependencyInjection;

/// <summary>
/// 服务注册扩展
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // 注册仓储
        services.AddScoped<ISystemConfigRepository, SystemConfigRepository>();

        // 注册服务
        services.AddScoped<ISettingsService, SettingsService>();

        return services;
    }
}
