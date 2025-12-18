# Change: Add System Settings and User Management Features

## Why

The current application lacks centralized system configuration capabilities, making it difficult to:
- Manage system-wide settings (task classes, equipment models, capacity levels)
- Enable users to manage their own account settings (password, avatar)
- Provide administrators with tools to reset user passwords
- Configure travel-related labels and tags

Currently, task class management is scattered, and users have no way to change their personal settings. This change consolidates system administration into a unified "Settings" interface while empowering users with self-service capabilities.

## What Changes

### New Features
1. **Settings Navigation Entry**
   - Add "设置" (Settings) menu item in the bottom-left sidebar (above personnel info)
   - New Settings page with tabbed interface for different configuration categories

2. **Task Class Management**
   - Move TaskClass management from separate view into Settings
   - Allow editing existing task classes and adding new ones
   - Maintain existing 9-category structure with subcategories

3. **Equipment Configuration**
   - Add "机型管理" (Model Management) tab
   - Support adding new turbine models (Francis, Kaplan, etc.)
   - Pre-populated with common models from existing data
   - **Permission**: Only Administrators and Leaders can add/edit/delete models

4. **Capacity Level Management**
   - Add "容量等级管理" (Capacity Level Management) tab
   - Support adding new capacity levels (300MW, 600MW, 1000MW, etc.)
   - Pre-populated with existing capacity levels from tasks
   - **Permission**: Only Administrators and Leaders can add/edit/delete capacity levels

5. **Travel Label Configuration**
   - Add "差旅标签设置" (Travel Label Settings) tab
   - Allow customization of travel-related labels and categories
   - Support dynamic addition/removal of travel types
   - **Permission**: Only Administrators and Leaders can configure travel labels

6. **Password Management**
   - **User Self-Service**: All users can change their own password
   - **Admin/Leader Reset**: Only Administrators and Leaders can reset any user's password
   - **Permission**: Password reset restricted to ADMIN and LEADER roles only
   - Password change requires current password verification
   - Password reset generates temporary password (displayed to admin/leader)

7. **Avatar Management**
   - Add avatar upload/change functionality for users
   - Support common image formats (JPG, PNG, GIF)
   - Store avatars in localStorage as base64 (with size limits)
   - Default avatar for users without custom avatar

### UI/UX Changes
- **Sidebar Layout**: Settings menu item positioned between main content and Personnel section
- **Settings Page**: Tabbed interface with 6 sections
- **User Profile**: Add profile section showing current user info with avatar
- **Password Forms**: Secure password change/reset flows with validation
- **Data Persistence**: All settings stored in localStorage with appropriate keys

## Impact

### Affected Specs
- **Settings Management**: New capability for system configuration
- **User Management**: Enhanced with password/avatar features

### Affected Code
- **components/Layout.tsx**: Add Settings navigation entry
- **components/Settings.tsx**: New Settings page component (to be created)
- **services/dataService.ts**: Add methods for password management, avatar storage
- **types.ts**: May need new interfaces for settings data
- **components/TaskClassView.tsx**: May be integrated into Settings
- **components/PersonnelView.tsx**: May add admin password reset actions

### Breaking Changes
- **None**: This is purely additive functionality
- **Navigation**: New menu item added to sidebar (non-breaking UI change)
- **Data Model**: New localStorage keys for settings and avatars (non-breaking)

### New Dependencies
- **None**: Uses existing Lucide React icons
- **Image Handling**: Browser FileReader API for avatar uploads

### Migration Plan
- Existing TaskClassView will remain accessible during transition
- New settings will initialize with empty/default values on first run
- Existing user data remains unchanged
- Avatars are optional - users can continue without custom avatars

## Open Questions

1. Should password complexity requirements be implemented (min length, special characters)?
2. What should be the maximum avatar file size limit?
3. Should we support removing task classes that are in use by existing tasks?
4. Should changes to机型 and容量等级 propagate to existing tasks or only affect new tasks?
5. Should audit logging be added for password resets and settings changes?

## Approval Required
**Yes** - This is a significant feature addition affecting multiple components and introducing new user workflows.
