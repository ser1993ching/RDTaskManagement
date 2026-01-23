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

var builder = WebApplication.CreateBuilder(args);

// CORS - Allow frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // 使用camelCase命名策略 - JSON字段统一使用camelCase
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
        options.JsonSerializerOptions.WriteIndented = false;
        // 使用Display(Name)属性序列化枚举为中文
        options.JsonSerializerOptions.Converters.Add(new DisplayNameEnumConverterFactory());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "YourSecretKeyHere12345678901234567890";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "R&DTaskSystem";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "R&DTaskSystemClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
    };
});

builder.Services.AddAuthorization();

// DbContext - MySQL connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mysqlOptions =>
        {
            mysqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(2),
                errorNumbersToAdd: null);
            // 指定迁移程序集
            mysqlOptions.MigrationsAssembly("TaskManageSystem.Infrastructure");
        });
    });
}

// Log DbContext - API请求日志 (使用工厂模式避免作用域问题)
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

// Log Service
builder.Services.AddScoped<ILogService>(sp =>
{
    var factory = sp.GetRequiredService<IDbContextFactory<LogDbContext>>();
    var logger = sp.GetRequiredService<ILogger<LogService>>();
    return new LogService(factory, logger);
});

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITaskClassRepository, TaskClassRepository>();
builder.Services.AddScoped<ITaskPoolRepository, TaskPoolRepository>();
builder.Services.AddScoped<ISystemConfigRepository, SystemConfigRepository>();

builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// Services - with repository injection
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService>(sp =>
{
    var repo = sp.GetRequiredService<ITaskRepository>();
    var mapper = sp.GetRequiredService<IMapper>();
    return new TaskService(repo, mapper);
});
builder.Services.AddScoped<ITaskClassService, TaskClassService>();
builder.Services.AddScoped<ITaskPoolService, TaskPoolService>();
builder.Services.AddScoped<IStatisticsService, StatisticsService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS redirection disabled for local development with Vite proxy
// app.UseHttpsRedirection();
app.UseCors("AllowAll");

// 全局异常处理中间件 - 必须放在最前面，捕获所有异常
app.UseExceptionHandling();

app.UseAuthentication();
app.UseAuthorization();

// API日志中间件 - 记录所有API请求到数据库
app.UseApiLogging();

// Health check endpoint - 检测后端服务和数据库连接状态
app.MapGet("/api/health", (AppDbContext context) => {
    try {
        var canConnect = context.Database.CanConnect();
        return Results.Ok(new {
            status = "ok",
            database = canConnect ? "connected" : "disconnected"
        });
    } catch (Exception ex) {
        return Results.Ok(new {
            status = "ok",
            database = "error",
            error = ex.Message
        });
    }
});

app.MapControllers();

// 应用启动关键阶段日志
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var logService = scope.ServiceProvider.GetRequiredService<ILogService>();

    // 记录应用启动日志
    await LogStartupEventAsync(logger, logService, "Application starting...");

    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // 测试数据库连接
    try
    {
        var canConnect = context.Database.CanConnect();
        if (canConnect)
        {
            logger.LogInformation("Database connection successful");
            await LogDatabaseEventAsync(logService, "Database connection", true, "Connected to MySQL database");

            // Ensure database is created
            context.Database.EnsureCreated();
            logger.LogInformation("Database schema verified/created");
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

// 自定义枚举序列化器：使用 Display(Name) 属性值
public class DisplayNameEnumConverter<T> : JsonConverter<T> where T : struct, Enum
{
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        string value = reader.GetString();
        if (value == null) return default;

        // 尝试通过 Display(Name) 找到对应的枚举值
        foreach (T enumValue in Enum.GetValues(typeToConvert))
        {
            var displayAttr = enumValue.GetType()
                .GetField(enumValue.ToString())
                ?.GetCustomAttributes(typeof(DisplayAttribute), false)
                .FirstOrDefault() as DisplayAttribute;

            if (displayAttr != null && displayAttr.Name == value)
            {
                return enumValue;
            }
        }

        // 如果找不到匹配的DisplayName，尝试直接解析
        if (Enum.TryParse<T>(value, ignoreCase: true, out T result))
        {
            return result;
        }

        return default;
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        var displayAttr = value.GetType()
            .GetField(value.ToString())
            ?.GetCustomAttributes(typeof(DisplayAttribute), false)
            .FirstOrDefault() as DisplayAttribute;

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

// 为所有枚举类型创建转换器的工厂
public class DisplayNameEnumConverterFactory : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert)
    {
        return typeToConvert.IsEnum;
    }

    public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var converterType = typeof(DisplayNameEnumConverter<>).MakeGenericType(typeToConvert);
        return (JsonConverter?)Activator.CreateInstance(converterType);
    }
}
