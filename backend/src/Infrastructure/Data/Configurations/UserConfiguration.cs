using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using R&DTaskSystem.Domain.Entities;

namespace R&DTaskSystem.Infrastructure.Data.Configurations;

/// <summary>
/// 用户实体配置 - MySQL适配
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users")
            .HasCharSet("utf8mb4");

        builder.HasKey(u => u.UserID);
        builder.Property(u => u.UserID).HasMaxLength(50).IsRequired();
        builder.Property(u => u.Name).HasMaxLength(100).IsRequired();
        builder.Property(u => u.PasswordHash).HasMaxLength(255);
        builder.Property(u => u.Title).HasMaxLength(100);
        builder.Property(u => u.Education).HasMaxLength(50);
        builder.Property(u => u.School).HasMaxLength(200);
        builder.Property(u => u.Remark).HasColumnType("LONGTEXT");

        builder.HasIndex(u => u.SystemRole);
        builder.HasIndex(u => u.OfficeLocation);
        builder.HasIndex(u => u.Status);
    }
}
