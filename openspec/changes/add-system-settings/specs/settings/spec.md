## ADDED Requirements

### Requirement: Settings Navigation Entry
The system SHALL provide a "设置" (Settings) menu item in the left sidebar navigation, positioned between the main content area and the Personnel section.

#### Scenario: Access settings from navigation
- **WHEN** user clicks the Settings menu item in the sidebar
- **THEN** the Settings page opens with a tabbed interface

#### Scenario: Settings icon display
- **WHEN** Settings page is rendered
- **THEN** a Settings icon from Lucide React is displayed next to the menu text

### Requirement: Task Class Management in Settings
The system SHALL allow users to manage task classes within the Settings page, enabling them to view, add, edit, and delete task class categories.

#### Scenario: View existing task classes
- **WHEN** user navigates to Settings > Task Class Management tab
- **THEN** all existing task classes are displayed with their names, codes, and descriptions

#### Scenario: Add new task class
- **WHEN** user clicks "Add" button and provides valid task class details
- **THEN** new task class is created and appears in the list

#### Scenario: Edit task class
- **WHEN** user clicks edit icon for a task class and modifies details
- **THEN** changes are saved and reflected in the task class list

#### Scenario: Delete task class
- **WHEN** user clicks delete icon and confirms deletion
- **THEN** task class is marked as is_deleted and removed from active list

### Requirement: Model Management (机型管理)
The system SHALL allow users to manage equipment models (机型) through the Settings page.

#### Scenario: View existing models
- **WHEN** user navigates to Settings > Model Management tab
- **THEN** all available equipment models are displayed

#### Scenario: Add new model (Admin/Leader only)
- **WHEN** user with ADMIN or LEADER role enters a new model name and saves
- **THEN** model is added to the available models list

#### Scenario: Delete model (Admin/Leader only)
- **WHEN** user with ADMIN or LEADER role selects a model and clicks delete
- **THEN** model is removed from the list

#### Scenario: Member cannot add models
- **WHEN** user with MEMBER role attempts to add a new model
- **THEN** system disables the add button or displays permission denied message

#### Scenario: Member cannot delete models
- **WHEN** user with MEMBER role attempts to delete a model
- **THEN** system disables the delete button or displays permission denied message

### Requirement: Capacity Level Management (容量等级管理)
The system SHALL allow users to manage capacity levels through the Settings page.

#### Scenario: View capacity levels
- **WHEN** user navigates to Settings > Capacity Level Management tab
- **THEN** all capacity levels (e.g., 300MW, 600MW, 1000MW) are displayed

#### Scenario: Add new capacity level (Admin/Leader only)
- **WHEN** user with ADMIN or LEADER role enters a new capacity level and saves
- **THEN** capacity level is added and available for selection in tasks

#### Scenario: Delete capacity level (Admin/Leader only)
- **WHEN** user with ADMIN or LEADER role selects a capacity level and deletes it
- **THEN** capacity level is removed from the list

#### Scenario: Member cannot add capacity levels
- **WHEN** user with MEMBER role attempts to add a new capacity level
- **THEN** system disables the add button or displays permission denied message

#### Scenario: Member cannot delete capacity levels
- **WHEN** user with MEMBER role attempts to delete a capacity level
- **THEN** system disables the delete button or displays permission denied message

### Requirement: Travel Label Settings (差旅标签设置)
The system SHALL allow users to customize travel-related labels and categories through the Settings page.

#### Scenario: View travel labels
- **WHEN** user navigates to Settings > Travel Label Settings tab
- **THEN** all travel labels (e.g., 市场配合出差, 项目执行出差) are displayed

#### Scenario: Add travel label (Admin/Leader only)
- **WHEN** user with ADMIN or LEADER role enters a new travel label and saves
- **THEN** label is added to the travel categories list

#### Scenario: Delete travel label (Admin/Leader only)
- **WHEN** user with ADMIN or LEADER role selects a label and deletes it
- **THEN** label is removed from the list

#### Scenario: Member cannot add travel labels
- **WHEN** user with MEMBER role attempts to add a new travel label
- **THEN** system disables the add button or displays permission denied message

#### Scenario: Member cannot delete travel labels
- **WHEN** user with MEMBER role attempts to delete a travel label
- **THEN** system disables the delete button or displays permission denied message

### Requirement: Settings Data Persistence
The system SHALL persist all settings data in localStorage and restore them across browser sessions.

#### Scenario: Settings persist across page reload
- **WHEN** user makes changes to settings and reloads the page
- **THEN** all settings remain as configured

#### Scenario: Settings initialize on first run
- **WHEN** application loads for the first time
- **THEN** settings initialize with default/empty values

#### Scenario: Settings persist after logout/login
- **WHEN** user logs out and logs back in
- **THEN** all previously configured settings remain intact
