using System.ComponentModel.DataAnnotations;

namespace TaskManageSystem.Domain.Enums;

/// <summary>
/// 人员状态
/// </summary>
public enum PersonnelStatus
{
    [Display(Name = "在岗")]
    Active = 0,

    [Display(Name = "借调")]
    BorrowedIn = 1,

    [Display(Name = "外借")]
    BorrowedOut = 2,

    [Display(Name = "实习")]
    Intern = 3,

    [Display(Name = "离岗")]
    Leave = 4
}
