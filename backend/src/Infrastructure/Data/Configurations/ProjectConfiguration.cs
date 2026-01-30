using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.ValueGeneration;
using TaskManageSystem.Domain.Entities;

namespace TaskManageSystem.Infrastructure.Data.Configurations;

/// <summary>
/// 项目实体配置 - MySQL适配
/// </summary>
public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("projects")
            .HasCharSet("utf8mb4");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasMaxLength(50)
            .IsRequired()
            .HasValueGenerator<ProjectIdGenerator>();
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.WorkNo).HasMaxLength(100);
        builder.Property(p => p.Capacity).HasMaxLength(50);
        builder.Property(p => p.Model).HasMaxLength(100);
        builder.Property(p => p.Remark).HasColumnType("LONGTEXT");

        builder.HasIndex(p => p.Category);
        builder.HasIndex(p => p.StartDate);
    }
}

/// <summary>
/// 项目ID生成器
/// </summary>
public class ProjectIdGenerator : ValueGenerator<string>
{
    private int _counter = 0;

    public override string Next(EntityEntry entry)
    {
        return $"PRJ{++_counter:D3}";
    }

    public override bool GeneratesTemporaryValues => false;
}
