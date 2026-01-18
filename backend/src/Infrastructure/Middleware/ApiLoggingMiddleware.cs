using System.Diagnostics;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Middleware;

/// <summary>
/// API请求日志中间件
/// 记录所有API请求的详细信息
/// </summary>
public class ApiLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiLoggingMiddleware> _logger;

    public ApiLoggingMiddleware(RequestDelegate next, ILogger<ApiLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 跳过Swagger等非API请求
        var path = context.Request.Path.Value ?? "";
        if (path.StartsWith("/swagger") || path.StartsWith("/_framework") || path.StartsWith("/_content"))
        {
            await _next(context);
            return;
        }

        var stopwatch = Stopwatch.StartNew();
        var requestId = context.TraceIdentifier;
        var userId = context.User?.Identity?.Name ?? "Anonymous";

        // 记录请求信息
        _logger.LogInformation(
            "[{RequestId}] 请求: {Method} {Path} | User: {UserId} | Query: {Query}",
            requestId,
            context.Request.Method,
            path,
            userId,
            context.Request.QueryString.Value);

        // 捕获请求体（仅限POST/PUT/PATCH）
        string? requestBody = null;
        if (context.Request.Method is "POST" or "PUT" or "PATCH")
        {
            context.Request.EnableBuffering();
            using var reader = new StreamReader(
                context.Request.Body,
                encoding: System.Text.Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                bufferSize: 1024,
                leaveOpen: true);
            requestBody = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;

            // 记录请求体（限制长度）
            if (requestBody.Length > 500)
            {
                requestBody = requestBody[..500] + "...";
            }
            _logger.LogDebug("[{RequestId}] 请求体: {Body}", requestId, requestBody);
        }

        // 获取客户端IP
        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

        // 获取User-Agent
        var userAgent = context.Request.Headers.UserAgent.ToString();

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            // 记录响应信息
            var statusCode = context.Response.StatusCode;
            var statusInfo = statusCode >= 200 && statusCode < 300 ? "成功" :
                            statusCode >= 400 && statusCode < 500 ? "客户端错误" :
                            statusCode >= 500 ? "服务端错误" : "未知";

            _logger.LogInformation(
                "[{RequestId}] 响应: {StatusCode} {StatusInfo} | 耗时: {Elapsed}ms",
                requestId,
                statusCode,
                statusInfo,
                stopwatch.ElapsedMilliseconds);

            // 警告级别的日志
            if (statusCode >= 400)
            {
                _logger.LogWarning(
                    "[{RequestId}] 请求失败: {Method} {Path} | StatusCode: {StatusCode}",
                    requestId,
                    context.Request.Method,
                    path,
                    statusCode);
            }

            // 保存到数据库（异步，不阻塞响应）
            _ = SaveLogToDatabaseAsync(context, requestId, userId, requestBody, statusCode, statusInfo, stopwatch.ElapsedMilliseconds, clientIp, userAgent);
        }
    }

    private async Task SaveLogToDatabaseAsync(
        HttpContext context,
        string requestId,
        string userId,
        string? requestBody,
        int statusCode,
        string statusInfo,
        long elapsedMs,
        string clientIp,
        string userAgent)
    {
        try
        {
            var logService = context.RequestServices.GetService(typeof(ILogService)) as ILogService;
            if (logService == null) return;

            var log = new ApiLog
            {
                RequestId = requestId,
                UserId = userId,
                Method = context.Request.Method,
                Path = context.Request.Path.Value ?? "",
                QueryString = context.Request.QueryString.Value,
                RequestBody = requestBody,
                StatusCode = statusCode,
                StatusInfo = statusInfo,
                IsSuccess = statusCode >= 200 && statusCode < 400,
                ElapsedMilliseconds = elapsedMs,
                ClientIp = clientIp,
                UserAgent = userAgent.Length > 512 ? userAgent[..512] : userAgent,
                CreatedAt = DateTime.Now
            };

            await logService.LogAsync(log);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "保存API日志到数据库失败: {RequestId}", requestId);
        }
    }
}

/// <summary>
/// 扩展方法，方便注册中间件
/// </summary>
public static class ApiLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseApiLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ApiLoggingMiddleware>();
    }
}
