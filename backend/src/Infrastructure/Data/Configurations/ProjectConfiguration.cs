using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using R&DTaskSystem.Domain.Entities;

namespace R&DTaskSystem.Infrastructure.Data.Configurations;

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
        builder.Property(p => p.Id).HasMaxLength(50).IsRequired();
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.WorkNo).HasMaxLength(100);
        builder.Property(p => p.Capacity).HasMaxLength(50);
        builder.Property(p => p.Model).HasMaxLength(100);
        builder.Property(p => p.Remark).HasColumnType("LONGTEXT");

        builder.HasIndex(p => p.Category);
        builder.HasIndex(p => p.StartDate);
    }
}
