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

    // 高频请求路径（不记录日志）
    private static readonly HashSet<string> HighFrequencyPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/tasks/personal",
        "/api/statistics/dashboard",
        "/api/statistics/personal",
        "/api/health",
    };

    // 上次记录日志的时间（用于节流）
    private static DateTime _lastLogTime = DateTime.MinValue;
    private static readonly TimeSpan MinLogInterval = TimeSpan.FromSeconds(1);

    public async Task InvokeAsync(HttpContext context)
    {
        // 跳过Swagger等非API请求
        var path = context.Request.Path.Value ?? "";
        if (path.StartsWith("/swagger") || path.StartsWith("/_framework") || path.StartsWith("/_content"))
        {
            await _next(context);
            return;
        }

        // 检查是否为高频请求路径（用于节流）
        var isHighFrequencyPath = HighFrequencyPaths.Any(p => path.StartsWith(p));

        // 节流：每秒最多记录一次日志
        var now = DateTime.Now;
        var shouldSkipLogging = isHighFrequencyPath && (now - _lastLogTime) < MinLogInterval;

        var stopwatch = Stopwatch.StartNew();
        var requestId = context.TraceIdentifier;
        var userId = context.User?.Identity?.Name ?? "Anonymous";

        // 跳过高频请求的详细日志
        if (!shouldSkipLogging)
        {
            _logger.LogInformation(
                "[{RequestId}] 请求: {Method} {Path} | User: {UserId} | Query: {Query}",
                requestId,
                context.Request.Method,
                path,
                userId,
                context.Request.QueryString.Value);
        }

        // 捕获请求体（仅限POST/PUT/PATCH，且不是高频请求）
        string? requestBody = null;
        if (!shouldSkipLogging && context.Request.Method is "POST" or "PUT" or "PATCH")
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

        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = context.Request.Headers.UserAgent.ToString();

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            // 记录响应信息（高频请求简化日志）
            var statusCode = context.Response.StatusCode;
            if (!shouldSkipLogging)
            {
                var statusInfo = statusCode >= 200 && statusCode < 300 ? "成功" :
                                statusCode >= 400 && statusCode < 500 ? "客户端错误" :
                                statusCode >= 500 ? "服务端错误" : "未知";

                _logger.LogInformation(
                    "[{RequestId}] 响应: {StatusCode} | 耗时: {Elapsed}ms",
                    requestId,
                    statusCode,
                    stopwatch.ElapsedMilliseconds);
            }

            if (statusCode >= 400)
            {
                _logger.LogWarning(
                    "[{RequestId}] 请求失败: {Method} {Path} | StatusCode: {StatusCode}",
                    requestId,
                    context.Request.Method,
                    path,
                    statusCode);
            }

            // 更新节流时间
            if (!shouldSkipLogging)
            {
                _lastLogTime = now;
            }

            // 高频请求跳过数据库记录
            if (!isHighFrequencyPath)
            {
                _ = SaveLogToDatabaseAsync(context, requestId, userId, requestBody, statusCode, stopwatch.ElapsedMilliseconds, clientIp, userAgent);
            }
        }
    }

    private async Task SaveLogToDatabaseAsync(
        HttpContext context,
        string requestId,
        string userId,
        string? requestBody,
        int statusCode,
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
                StatusInfo = statusCode >= 200 && statusCode < 300 ? "成功" :
                            statusCode >= 400 && statusCode < 500 ? "客户端错误" :
                            statusCode >= 500 ? "服务端错误" : "未知",
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
/// 全局异常处理中间件
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            KeyNotFoundException => (404, exception.Message),
            UnauthorizedAccessException => (401, "未授权访问"),
            ArgumentException => (400, exception.Message),
            _ => (500, "服务器内部错误")
        };

        context.Response.StatusCode = statusCode;

        var response = new
        {
            Success = false,
            Data = (string?)null,
            Message = (string?)null,
            Error = new
            {
                Code = exception.GetType().Name,
                Message = message
            }
        };

        await context.Response.WriteAsJsonAsync(response);
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

    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}
