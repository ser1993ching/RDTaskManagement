using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Data.Configurations;

/// <summary>
/// 任务库实体配�?- MySQL适配
/// </summary>
public class TaskPoolItemConfiguration : IEntityTypeConfiguration<TaskPoolItem>
{
    public void Configure(EntityTypeBuilder<TaskPoolItem> builder)
    {
        builder.ToTable("task_pool")
            .HasCharSet("utf8mb4");

        builder.HasKey(tp => tp.Id);
        builder.Property(tp => tp.Id).HasMaxLength(50).IsRequired();
        builder.Property(tp => tp.TaskName).HasMaxLength(200).IsRequired();
        builder.Property(tp => tp.TaskClassID).HasMaxLength(20).IsRequired();
        builder.Property(tp => tp.Category).HasMaxLength(50).IsRequired();
        builder.Property(tp => tp.ProjectID).HasMaxLength(50);
        builder.Property(tp => tp.ProjectName).HasMaxLength(200);
        builder.Property(tp => tp.Remark).HasColumnType("LONGTEXT");

        // 索引
        builder.HasIndex(tp => tp.TaskClassID);
        builder.HasIndex(tp => tp.ProjectID);
        builder.HasIndex(tp => tp.CreatedDate);

        // 关系
        builder.HasOne(tp => tp.Creator).WithMany().HasForeignKey(tp => tp.CreatedBy).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(tp => tp.Project).WithMany(p => p.PoolItems).HasForeignKey(tp => tp.ProjectID).OnDelete(DeleteBehavior.SetNull);
    }
}
