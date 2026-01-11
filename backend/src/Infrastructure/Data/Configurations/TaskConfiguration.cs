using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Data.Configurations;

/// <summary>
/// 任务实体配置 - MySQL适配
/// </summary>
public class TaskConfiguration : IEntityTypeConfiguration<Task>
{
    public void Configure(EntityTypeBuilder<Task> builder)
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

        // 关系
        builder.HasOne(t => t.Assignee).WithMany().HasForeignKey(t => t.AssigneeID).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(t => t.Checker).WithMany().HasForeignKey(t => t.CheckerID).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(t => t.Approver).WithMany().HasForeignKey(t => t.ApproverID).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(t => t.Creator).WithMany().HasForeignKey(t => t.CreatedBy).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(t => t.Project).WithMany(p => p.Tasks).HasForeignKey(t => t.ProjectID).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(t => t.TaskClass).WithMany().HasForeignKey(t => t.TaskClassID).OnDelete(DeleteBehavior.Restrict);
    }
}
