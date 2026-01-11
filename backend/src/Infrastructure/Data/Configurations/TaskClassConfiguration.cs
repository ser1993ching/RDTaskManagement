using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using R&DTaskSystem.Domain.Entities;

namespace R&DTaskSystem.Infrastructure.Data.Configurations;

/// <summary>
/// 任务类别实体配置
/// </summary>
public class TaskClassConfiguration : IEntityTypeConfiguration<TaskClass>
{
    public void Configure(EntityTypeBuilder<TaskClass> builder)
    {
        builder.ToTable("task_classes");
        builder.HasKey(tc => tc.Id);
        builder.Property(tc => tc.Id).HasMaxLength(20).IsRequired();
        builder.Property(tc => tc.Name).HasMaxLength(100).IsRequired();
        builder.Property(tc => tc.Code).HasMaxLength(50).IsRequired();
        builder.Property(tc => tc.Description).HasColumnType("TEXT");
        builder.Property(tc => tc.Notice).HasColumnType("TEXT");

        builder.HasIndex(tc => tc.Code).IsUnique();
    }
}
