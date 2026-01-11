using R&DTaskSystem.Application.Interfaces;
using R&DTaskSystem.Application.Services;
using R&DTaskSystem.Domain.Entities;
using R&DTaskSystem.Domain.Enums;
using R&DTaskSystem.Infrastructure.Data;
using R&DTaskSystem.Infrastructure.Repositories;

namespace R&DTaskSystem.Api.DependencyInjection;

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
