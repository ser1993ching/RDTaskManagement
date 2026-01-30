using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Data.Configurations;

/// <summary>
/// SystemConfig 实体配置
/// </summary>
public class SystemConfigConfiguration : IEntityTypeConfiguration<SystemConfig>
{
    public void Configure(EntityTypeBuilder<SystemConfig> builder)
    {
        builder.ToTable("SystemConfigs");

        // 主键
        builder.HasKey(e => e.Id);

        // 唯一索引：Category + Key 组合
        builder.HasIndex(e => new { e.ConfigCategory, e.ConfigKey })
               .IsUnique()
               .HasDatabaseName("IX_SystemConfigs_Category_Key");

        // 索引：按类别查询
        builder.HasIndex(e => e.ConfigCategory)
               .HasDatabaseName("IX_SystemConfigs_Category");

        // 属性配置
        builder.Property(e => e.ConfigKey)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(e => e.ConfigCategory)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(e => e.ConfigValue)
               .IsRequired();

        builder.Property(e => e.Description)
               .HasMaxLength(500);
    }
}
