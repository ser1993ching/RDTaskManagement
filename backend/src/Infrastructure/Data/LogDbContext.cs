using Microsoft.EntityFrameworkCore;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Data;

/// <summary>
/// 日志数据库上下文
/// </summary>
public class LogDbContext : DbContext
{
    public LogDbContext(DbContextOptions<LogDbContext> options) : base(options)
    {
    }

    public DbSet<ApiLog> ApiLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ApiLog 配置
        modelBuilder.Entity<ApiLog>(entity =>
        {
            entity.ToTable("api_logs");

            // 索引优化查询性能
            entity.HasIndex(e => e.RequestId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Path);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.IsSuccess);
            entity.HasIndex(e => e.StatusCode);

            // 复合索引用于日志查询
            entity.HasIndex(e => new { e.CreatedAt, e.IsSuccess });
        });
    }
}
