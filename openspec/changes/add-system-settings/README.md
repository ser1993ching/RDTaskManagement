# Change Proposal: Add System Settings and User Management Features

## Overview
This proposal adds a comprehensive settings system to the R&D Task Management application, including system configuration, user self-service capabilities, and administrative tools.

## What This Adds

### 🎛️ Settings Interface
- **Location**: New "设置" menu in left sidebar (above Personnel section)
- **Structure**: Tabbed interface with 6 main sections
- **Access**: All authenticated users can access settings

### 📋 Settings Sections

1. **Task Class Management (任务类别管理)**
   - Migrate from existing TaskClassView into Settings
   - Add/edit/delete task categories
   - Manage subcategories

2. **Model Management (机型管理)** 🔒
   - Add/remove equipment models (Francis, Kaplan, etc.)
   - Pre-populated from existing project data
   - **Permission**: Only Administrators and Leaders can add/edit/delete

3. **Capacity Level Management (容量等级管理)** 🔒
   - Add/remove capacity levels (300MW, 600MW, 1000MW, etc.)
   - Pre-populated from existing tasks
   - **Permission**: Only Administrators and Leaders can add/edit/delete

4. **Travel Label Settings (差旅标签设置)** 🔒
   - Customize travel-related labels
   - Add/remove travel categories
   - **Permission**: Only Administrators and Leaders can configure

5. **User Profile (用户资料)**
   - View profile information
   - Upload/change avatar
   - Display current user info

6. **Password Management (密码管理)**
   - **All Users**: Change your own password
   - **Admin/Leader Only**: Reset other users' passwords 🔒

### 🔑 Key Features

#### Password Management
- **For All Users**: Change your own password with current password verification
- **For Admins/Leaders**: Reset any user's password with temporary password generation
- **Security**: Passwords masked in forms, basic validation

#### Avatar Management
- **Upload**: Support JPG, PNG, GIF formats
- **Storage**: localStorage as base64
- **Default Avatar**: Auto-generated from user initials if no custom avatar
- **Display**: Show avatars throughout the app (profile, task lists, user lists)

### 📁 Files to Create/Modify

**New Files:**
- `components/Settings.tsx` - Main settings page component

**Modified Files:**
- `components/Layout.tsx` - Add Settings navigation
- `services/dataService.ts` - Add password/avatar/settings methods
- `types.ts` - Add settings-related interfaces if needed

**Potentially Modified:**
- `components/TaskClassView.tsx` - May be integrated into Settings
- `components/PersonnelView.tsx` - Add admin password reset actions

### ✅ Validation Status
- **Proposal Status**: ✅ Validated successfully
- **Task Count**: 42 tasks listed in tasks.md
- **Requirements**: 14 requirements across 2 specs (settings, user-management)

### 🚀 Next Steps
1. **Review** the proposal in `proposal.md`
2. **Approve** the change (requires approval per proposal)
3. **Implement** tasks in order (see `tasks.md`)
4. **Test** all functionality before marking complete
5. **Archive** the change after deployment

### 📚 Documentation
- Full proposal: `proposal.md`
- Implementation tasks: `tasks.md`
- Spec deltas:
  - `specs/settings/spec.md` - System settings requirements
  - `specs/user-management/spec.md` - User management requirements

### 🔍 Review Checklist
- [ ] Business requirements understood
- [ ] Technical approach reviewed
- [ ] Impact on existing features considered
- [ ] Open questions resolved
- [ ] Approval granted

### 💡 Open Questions (from proposal)
1. Password complexity requirements?
2. Maximum avatar file size limit?
3. Allow deleting task classes in use?
4. Propagate机型/容量等级 changes to existing tasks?
5. Add audit logging for password resets?

---
**Change ID**: add-system-settings  
**Status**: Pending Approval  
**Created**: 2025-12-18
