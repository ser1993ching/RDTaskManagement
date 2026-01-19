using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Data.Configurations;

/// <summary>
/// 任务实体配置 - MySQL适配
/// </summary>
public class TaskConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("tasks")
            .HasCharSet("utf8mb4");

        builder.HasKey(t => t.TaskID);
        builder.Property(t => t.TaskID).HasMaxLength(50).IsRequired();
        builder.Property(t => t.TaskName).HasMaxLength(200).IsRequired();
        builder.Property(t => t.TaskClassID).HasMaxLength(20).IsRequired();
        builder.Property(t => t.Category).HasMaxLength(50).IsRequired();
        builder.Property(t => t.AssigneeID).HasMaxLength(50);
        builder.Property(t => t.AssigneeName).HasMaxLength(100);
        builder.Property(t => t.TravelLocation).HasMaxLength(200);
        builder.Property(t => t.TravelLabel).HasMaxLength(50);
        builder.Property(t => t.CapacityLevel).HasMaxLength(50);
        builder.Property(t => t.Remark).HasColumnType("LONGTEXT");
        builder.Property(t => t.Participants).HasColumnType("LONGTEXT");
        builder.Property(t => t.ParticipantNames).HasColumnType("LONGTEXT");

        // 索引
        builder.HasIndex(t => t.TaskClassID);
        builder.HasIndex(t => t.ProjectID);
        builder.HasIndex(t => t.AssigneeID);
        builder.HasIndex(t => t.CheckerID);
        builder.HasIndex(t => t.ApproverID);
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.CreatedDate);
    }
}
