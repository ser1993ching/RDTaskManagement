using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Services;
using TaskManageSystem.Domain.Entities;
using TaskManageSystem.Domain.Enums;
using TaskManageSystem.Infrastructure.Data;
using TaskManageSystem.Infrastructure.Repositories;

namespace TaskManageSystem.Api.DependencyInjection;

/// <summary>
/// 服务注册扩展 - 临时实现（完整实现需要在Services文件中）
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        return services;
    }
}
