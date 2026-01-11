using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Domain.Enums;

/// <summary>
/// 人员状态
/// </summary>
public enum PersonnelStatus
{
    [Display(Name = "在职")]
    Active = 0,

    [Display(Name = "离职")]
    Inactive = 1,

    [Display(Name = "退休")]
    Retired = 2
}
