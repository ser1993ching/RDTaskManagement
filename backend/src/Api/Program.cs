/*
 * R&D任务管理系统后端入口文件 (Program.cs)
 *
 * 概述:
 * - 这是ASP.NET Core 8.0 Web API应用程序的入口点
 * - 配置了依赖注入、数据库连接、JWT认证、中间件等
 * - 应用程序启动时自动执行数据库迁移
 *
 * 主要配置模块:
 * 1. CORS配置 - 允许前端跨域访问
 * 2. 控制器配置 - JSON序列化使用camelCase命名策略
 * 3. JWT认证 - 基于令牌的身份验证
 * 4. MySQL数据库 - 使用Entity Framework Core连接
 * 5. 仓储和服务注册 - 依赖注入容器配置
 * 6. HTTP请求管道 - 中间件配置顺序很重要
 *
 * 启动流程:
 * 1. 创建WebApplication实例
 * 2. 配置开发环境的Swagger
 * 3. 配置CORS、中间件
 * 4. 测试数据库连接并执行迁移
 * 5. 启动HTTP服务器
 */

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text;
using System.ComponentModel.DataAnnotations;
using TaskManageSystem.Application.Interfaces;
using TaskManageSystem.Application.Repositories;
using TaskManageSystem.Application.Services;
using TaskManageSystem.Infrastructure.Data;
using TaskManageSystem.Infrastructure.Repositories;
using TaskManageSystem.Infrastructure.Services;
using TaskManageSystem.Infrastructure.Middleware;
using TaskManageSystem.Domain.Entities;
using AutoMapper;
using Microsoft.Extensions.Logging;

// 创建Web应用程序构建器
// 这行代码初始化了ASP.NET Core应用程序的配置系统
// 会自动加载appsettings.json等配置文件
var builder = WebApplication.CreateBuilder(args);

// ============================================
// 模块1: CORS跨域配置
// ============================================
// 由于前端(React)和后端分离部署，需要配置CORS允许跨域请求
// 开发环境下允许所有来源、方法、头部，便于前后端联调
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()      // 允许任何域名的请求
              .AllowAnyMethod()      // 允许任何HTTP方法(GET, POST, PUT, DELETE等)
              .AllowAnyHeader();     // 允许任何请求头
    });
});

// ============================================
// 模块2: 控制器和JSON序列化配置
// ============================================
// 添加MVC控制器支持，并配置JSON序列化选项
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // 【重要】JSON字段命名策略: 使用camelCase
        // 例如: taskId, userId, startDate (而非 PascalCase 的 TaskId, UserId)
        // 这是前后端约定的API JSON字段命名规范，确保数据格式一致性
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;

        // 启用属性名大小写不敏感匹配
        // 这样前端发送 camelCase 或 PascalCase 的JSON都能被正确解析
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;

        // 配置JSON编码器，允许非严格转义
        // 这样可以正确传输中文字符而不被转义为Unicode
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;

        // 不压缩JSON输出，便于调试时查看原始格式
        options.JsonSerializerOptions.WriteIndented = false;

        // 添加自定义枚举转换器：将枚举值序列化为Display(Name)属性指定的中文
        // 例如: TaskStatus.Completed -> "已完成" 而非 "Completed"
        options.JsonSerializerOptions.Converters.Add(new DisplayNameEnumConverterFactory());
    });

// 添加Swagger/OpenAPI支持，用于API文档和测试
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ============================================
// 模块3: JWT身份认证配置
// ============================================
// JWT (JSON Web Token) 用于无状态身份验证
// 用户登录成功后，服务端生成一个加密的Token，客户端后续请求携带此Token

// 从配置文件读取JWT配置，如果没有设置则使用默认值
// 注意：生产环境应该使用强密钥并从环境变量或密钥库读取
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "YourSecretKeyHere12345678901234567890";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "R&DTaskSystem";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "R&DTaskSystemClient";

// 配置JWT认证方案
builder.Services.AddAuthentication(options =>
{
    // 默认认证方案：当请求需要授权时，使用JWT Bearer认证
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    // 默认质询方案：未认证时返回401并要求提供有效Token
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // 配置Token验证参数
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,           // 验证Token签发者
        ValidateAudience = true,         // 验证Token接收者
        ValidateLifetime = true,         // 验证Token是否过期
        ValidateIssuerSigningKey = true, // 验证签名密钥

        // 签发者和接收者必须与生成Token时一致
        ValidIssuer = jwtIssuer;
        ValidAudience = jwtAudience;

        // 使用对称密钥进行签名验证（密钥必须至少32字节）
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
    };
});

// 添加授权策略支持（基于角色的访问控制）
builder.Services.AddAuthorization();

// ============================================
// 模块4: MySQL数据库配置 (Entity Framework Core)
// ============================================
// 从配置文件获取连接字符串
// 默认连接字符串在 appsettings.json 中配置
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrEmpty(connectionString))
{
    // 注册主数据库上下文 AppDbContext
    // 使用作用域生命周期：每次HTTP请求创建一个新实例
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        // 配置使用MySQL数据库
        // ServerVersion.AutoDetect 自动检测MySQL服务器版本
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mysqlOptions =>
        {
            // 配置连接失败重试策略
            // maxRetryCount: 最大重试次数
            // maxRetryDelay: 最大重试间隔
            mysqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(2),
                errorNumbersToAdd: null);

            // 指定迁移程序集为 Infrastructure 项目
            // 迁移文件将保存在 TaskManageSystem.Infrastructure 项目中
            mysqlOptions.MigrationsAssembly("TaskManageSystem.Infrastructure");
        });
    });
}

// ============================================
// 模块5: API日志数据库配置
// ============================================
// 使用 IDbContextFactory 模式注册日志数据库上下文
// 工厂模式允许在非依赖注入环境中创建DbContext实例
// 例如在后台服务、单例服务中需要创建新的DbContext实例时
builder.Services.AddDbContextFactory<LogDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mysqlOptions =>
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(2),
            errorNumbersToAdd: null);
        mysqlOptions.MigrationsAssembly("TaskManageSystem.Infrastructure");
    });
});

// 注册日志服务
// 使用工厂模式创建 LogDbContext 实例
builder.Services.AddScoped<ILogService>(sp =>
{
    // 从服务提供者获取 DbContextFactory 和 Logger
    var factory = sp.GetRequiredService<IDbContextFactory<LogDbContext>>();
    var logger = sp.GetRequiredService<ILogger<LogService>>();
    // 创建并返回日志服务实例
    return new LogService(factory, logger);
});

// ============================================
// 模块6: 仓储模式注册 (Repository Pattern)
// ============================================
// 仓储模式将数据访问逻辑与业务逻辑分离
// 每个仓储对应一个实体，负责CRUD操作
// 使用 Scoped 生命周期：每个HTTP请求创建一个实例

// 用户仓储 - 负责用户数据的增删改查
builder.Services.AddScoped<IUserRepository, UserRepository>();
// 项目仓储 - 负责项目数据的增删改查
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
// 任务仓储 - 负责任务数据的增删改查
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
// 任务分类仓储 - 负责任务分类数据的增删改查
builder.Services.AddScoped<ITaskClassRepository, TaskClassRepository>();
// 任务库仓储 - 负责任务库(计划任务)数据的增删改查
builder.Services.AddScoped<ITaskPoolRepository, TaskPoolRepository>();
// 系统配置仓储 - 负责系统配置数据的增删改查
builder.Services.AddScoped<ISystemConfigRepository, SystemConfigRepository>();

// ============================================
// 模块7: AutoMapper配置
// ============================================
// AutoMapper 用于自动映射不同对象之间的属性
// 例如：Entity <-> DTO, Request <-> Entity
// 配置文件的映射规则在 AutoMapperProfile.cs 中定义
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// ============================================
// 模块8: 业务服务注册 (Service Layer)
// ============================================
// 服务层包含业务逻辑，处理请求和响应
// 每个服务依赖相应的仓储进行数据访问

// 用户服务
builder.Services.AddScoped<IUserService, UserService>();
// 项目服务
builder.Services.AddScoped<IProjectService, ProjectService>();

// 任务服务 - 需要同时注入仓储和AutoMapper
builder.Services.AddScoped<ITaskService>(sp =>
{
    var repo = sp.GetRequiredService<ITaskRepository>();
    var mapper = sp.GetRequiredService<IMapper>();
    return new TaskService(repo, mapper);
});

// 任务分类服务
builder.Services.AddScoped<ITaskClassService, TaskClassService>();
// 任务库服务
builder.Services.AddScoped<ITaskPoolService, TaskPoolService>();
// 统计服务 - 提供各种统计数据接口
builder.Services.AddScoped<IStatisticsService, StatisticsService>();
// 系统设置服务 - 管理设备型号、容量等级等配置
builder.Services.AddScoped<ISettingsService, SettingsService>();

// ============================================
// 模块9: HTTP请求管道配置
// ============================================
// 中间件按顺序执行，形成请求处理管道
// 顺序非常重要：先注册的中间件先执行

var app = builder.Build();

// 在开发环境下启用Swagger
// Swagger提供API文档和测试界面，访问 /swagger 查看
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 禁用HTTPS重定向（开发环境使用Vite代理）
// 生产环境应该启用：app.UseHttpsRedirection();

// 1. CORS中间件 - 允许跨域请求
app.UseCors("AllowAll");

// 2. 请求体属性名转换中间件
// 将前端发送的camelCase属性名转换为后端期望的PascalCase
// 例如：userId -> UserId (必须在模型绑定之前执行)
app.UseCamelCaseToPascalCase();

// 3. 全局异常处理中间件
// 捕获管道中发生的所有异常，统一返回错误响应
// 必须在其他中间件之前注册，确保能捕获所有异常
app.UseExceptionHandling();

// 4. 认证中间件 - 验证请求中的JWT Token
app.UseAuthentication();

// 5. 授权中间件 - 检查用户是否有权限访问资源
app.UseAuthorization();

// 6. API日志中间件 - 记录所有API请求到数据库
// 记录请求信息、响应状态、处理时间等
app.UseApiLogging();

// 7. 模型验证错误处理中间件
// 处理控制器中数据验证失败的情况
// 在控制器执行后拦截并格式化错误响应
app.UseModelValidation();

// ============================================
// 模块10: 健康检查端点
// ============================================
// 前端定期调用此接口检测后端服务状态
// 返回后端服务和数据库连接状态
app.MapGet("/api/health", (AppDbContext context) => {
    try {
        // 测试数据库连接
        var canConnect = context.Database.CanConnect();
        return Results.Ok(new {
            status = "ok",
            database = canConnect ? "connected" : "disconnected"
        });
    } catch (Exception ex) {
        // 数据库连接失败时仍然返回200，前端根据database字段判断
        return Results.Ok(new {
            status = "ok",
            database = "error",
            error = ex.Message
        });
    }
});

// 映射所有控制器路由
// 控制器类中的 [Route] 和 [HttpGet/Post] 等属性定义的路由会被自动注册
app.MapControllers();

// ============================================
// 模块11: 应用启动和数据库初始化
// ============================================
// 在应用启动时执行数据库连接测试和迁移
// 使用 CreateScope() 创建独立的依赖注入作用域

using (var scope = app.Services.CreateScope())
{
    // 获取日志记录器和服务
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var logService = scope.ServiceProvider.GetRequiredService<ILogService>();

    // 记录应用启动事件
    await LogStartupEventAsync(logger, logService, "Application starting...");

    // 获取数据库上下文
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // 测试数据库连接并执行迁移
    try
    {
        var canConnect = context.Database.CanConnect();
        if (canConnect)
        {
            logger.LogInformation("Database connection successful");
            await LogDatabaseEventAsync(logService, "Database connection", true, "Connected to MySQL database");

            // 执行数据库迁移
            // Migrate() 会自动应用所有未执行的迁移
            // 确保数据库架构与代码中的实体定义同步
            context.Database.Migrate();
            logger.LogInformation("Database schema verified/created with migrations");
        }
        else
        {
            logger.LogWarning("Database connection failed");
            await LogDatabaseEventAsync(logService, "Database connection", false, "Cannot connect to database");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database connection error");
        await LogDatabaseEventAsync(logService, "Database connection", false, ex.Message);
    }
}

// 启动应用程序
// 此方法会阻塞当前线程，直到应用程序关闭
app.Run();

// 辅助方法：记录应用启动事件
async Task LogStartupEventAsync(ILogger<Program> logger, ILogService logService, string message)
{
    try
    {
        var log = new ApiLog
        {
            RequestId = Guid.NewGuid().ToString("N")[..16],
            UserId = "System",
            Method = "STARTUP",
            Path = "/",
            StatusInfo = "Information",
            IsSuccess = true,
            ElapsedMilliseconds = 0,
            ClientIp = "localhost",
            UserAgent = "R&DTaskSystem",
            CreatedAt = DateTime.Now
        };
        await logService.LogAsync(log);
        logger.LogInformation("Startup event logged to database");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Failed to log startup event");
    }
}

// 辅助方法：记录数据库事件
async Task LogDatabaseEventAsync(ILogService logService, string operation, bool success, string message)
{
    try
    {
        var log = new ApiLog
        {
            RequestId = Guid.NewGuid().ToString("N")[..16],
            UserId = "System",
            Method = "DATABASE",
            Path = $"/api/{operation.ToLower().Replace(" ", "-")}",
            StatusInfo = success ? "成功" : "失败",
            IsSuccess = success,
            ElapsedMilliseconds = 0,
            ClientIp = "localhost",
            UserAgent = "R&DTaskSystem",
            CreatedAt = DateTime.Now
        };
        await logService.LogAsync(log);
    }
    catch { /* 忽略日志记录错误 */ }
}

// ============================================
// 附录A: 自定义JSON转换器 - 枚举DisplayName序列化
// ============================================

/// <summary>
/// 自定义枚举JSON转换器
/// 功能：将枚举值序列化为Display(Name)属性指定的中文名称
/// 例如：TaskStatus.Completed 序列化为 "已完成" 而非 "Completed"
/// </summary>
/// <typeparam name="T">枚举类型</typeparam>
public class DisplayNameEnumConverter<T> : JsonConverter<T> where T : struct, Enum
{
    /// <summary>
    /// 反序列化：从JSON字符串读取枚举值
    /// 尝试匹配Display(Name)属性，如果匹配不到则尝试直接解析
    /// </summary>
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        string value = reader.GetString();
        if (value == null) return default;

        // 遍历所有枚举值，查找Display(Name)匹配的项
        foreach (T enumValue in Enum.GetValues(typeToConvert))
        {
            var displayAttr = enumValue.GetType()
                .GetField(enumValue.ToString())
                ?.GetCustomAttributes(typeof(DisplayAttribute), false)
                .FirstOrDefault() as DisplayAttribute;

            // 如果找到匹配的DisplayName，返回对应枚举值
            if (displayAttr != null && displayAttr.Name == value)
            {
                return enumValue;
            }
        }

        // 如果找不到DisplayName匹配，尝试直接解析枚举名称
        // 忽略大小写，例如 "completed" 也能匹配 TaskStatus.Completed
        if (Enum.TryParse<T>(value, ignoreCase: true, out T result))
        {
            return result;
        }

        return default;
    }

    /// <summary>
    /// 序列化：将枚举值写入JSON字符串
    /// 输出Display(Name)属性指定的中文名称
    /// </summary>
    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        // 获取枚举值的Display属性
        var displayAttr = value.GetType()
            .GetField(value.ToString())
            ?.GetCustomAttributes(typeof(DisplayAttribute), false)
            .FirstOrDefault() as DisplayAttribute;

        // 如果有DisplayName，使用DisplayName；否则使用枚举名称
        if (displayAttr != null && !string.IsNullOrEmpty(displayAttr.Name))
        {
            writer.WriteStringValue(displayAttr.Name);
        }
        else
        {
            writer.WriteStringValue(value.ToString());
        }
    }
}

/// <summary>
/// 枚举转换器工厂
/// 负责为每种枚举类型创建对应的 DisplayNameEnumConverter 实例
/// ASP.NET Core 的 JSON 序列化器会自动调用此工厂
/// </summary>
public class DisplayNameEnumConverterFactory : JsonConverterFactory
{
    /// <summary>
    /// 检查类型是否可以转换
    /// 只对枚举类型返回 true
    /// </summary>
    public override bool CanConvert(Type typeToConvert)
    {
        return typeToConvert.IsEnum;
    }

    /// <summary>
    /// 创建具体的枚举转换器实例
    /// 使用反射动态创建泛型类型 DisplayNameEnumConverter{T}
    /// </summary>
    public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        // 构造泛型类型：DisplayNameEnumConverter<当前枚举类型>
        var converterType = typeof(DisplayNameEnumConverter<>).MakeGenericType(typeToConvert);
        // 创建实例并返回
        return (JsonConverter?)Activator.CreateInstance(converterType);
    }
}
