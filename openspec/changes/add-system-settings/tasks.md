# Implementation Tasks: Add System Settings and User Management Features

## 1. Data Layer Enhancements
- [ ] 1.1 Extend dataService with password management methods
- [ ] 1.2 Add avatar storage methods to dataService
- [ ] 1.3 Add settings persistence methods (机型, 容量等级, 差旅标签)
- [ ] 1.4 Implement password change validation
- [ ] 1.5 Implement admin password reset functionality

## 2. Settings Page Component
- [ ] 2.1 Create Settings.tsx component with tabbed interface
- [ ] 2.2 Implement Task Class Management tab (migrate from TaskClassView)
- [ ] 2.3 Implement Model Management tab (机型管理)
- [ ] 2.4 Implement Capacity Level Management tab (容量等级管理)
- [ ] 2.5 Implement Travel Label Settings tab (差旅标签设置)
- [ ] 2.6 Implement User Profile tab with avatar upload
- [ ] 2.7 Implement Password Change tab
- [ ] 2.8 Add responsive design and error handling

## 3. Navigation Integration
- [ ] 3.1 Add Settings menu item to Layout.tsx sidebar
- [ ] 3.2 Position Settings between main content and Personnel
- [ ] 3.3 Add Settings icon from Lucide React
- [ ] 3.4 Implement routing to Settings page

## 4. User Management Features
- [ ] 4.1 Create password change form with current password verification
- [ ] 4.2 Create avatar upload component with preview
- [ ] 4.3 Add admin password reset interface in PersonnelView
- [ ] 4.4 Implement password reset confirmation dialog
- [ ] 4.5 Add temporary password display for admins

## 5. Data Migration and Initialization
- [ ] 5.1 Initialize default values for new settings (empty arrays)
- [ ] 5.2 Migrate existing TaskClassView data to settings structure
- [ ] 5.3 Pre-populate机型 and容量等级 from existing tasks
- [ ] 5.4 Set up default avatar for users without custom avatar

## 6. Testing and Validation
- [ ] 6.1 Test password change functionality (user perspective)
- [ ] 6.2 Test admin password reset
- [ ] 6.3 Test avatar upload and display
- [ ] 6.4 Test settings persistence across sessions
- [ ] 6.5 Test tab navigation and form validation
- [ ] 6.6 Verify no breaking changes to existing features

## 7. Documentation
- [ ] 7.1 Update user documentation with new features
- [ ] 7.2 Document settings data structure
- [ ] 7.3 Create admin guide for password management

## Implementation Notes

### Order of Implementation
1. Start with dataService enhancements (foundational)
2. Create Settings component structure
3. Add navigation integration
4. Implement each tab systematically
5. Add user management features
6. Test and validate

### Key Technical Decisions
- **Avatar Storage**: Use localStorage with base64 encoding
- **Password Validation**: Client-side validation only (suitable for internal tool)
- **Settings Structure**: Flat structure with category-specific keys
- **Default Avatars**: Generate initials-based avatar as fallback

### File Locations
- Settings component: `components/Settings.tsx`
- Enhanced dataService: `services/dataService.ts`
- Layout update: `components/Layout.tsx`
- Types updates: `types.ts` (if needed)

### Success Criteria
- [ ] Settings accessible via sidebar navigation
- [ ] All 6 tabs functional and persist data
- [ ] Users can change their own passwords
- [ ] Admins/Leaders can reset any user password
- [ ] Avatar upload works for all users
- [ ] Existing features remain unaffected
- [ ] Data persists across browser sessions
