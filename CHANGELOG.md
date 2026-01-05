# Changelog

All notable changes to this project will be documented in this file.

The format follows [Semantic Versioning 2.0.0](https://semver.org/).

> Versions prior to 1.0.0 indicate the project is still under active development.  
> Breaking changes may occur until version 1.0.0.

- **MAJOR version**: incompatible API changes  
- **MINOR version**: backward-compatible functionality  
- **PATCH version**: backward-compatible bug fixes  

- `0.0.x` → raw prototype, initial structure  
- `0.1.0` → first functional base (e.g., basic notes CRUD)  
- `0.2.x` up to `0.9.x` → iterative improvements and incremental features  
- `1.0.0` → stable release with:
  - Well-defined interfaces (e.g., Task, User, Tag, etc.)  
  - Architecture considered “ready” for real use  

---

## [1.0.0] - Unreleased
### Planned
- Complete implementation of user authentication and Firestore persistence.
- Custom notification sounds and settings integration.

--- 
## [0.7.1] - 2025-12-12

- Updated style

---
## [0.7.0] - 2025-12-12
### Added
- **Workspaces Architecture:**
    - **Multi-Workspaces System:** Introduced the ability to create, rename, and switch between independent dashboard contexts (e.g., "Personal", "Work", "Dev"), each maintaining its own widget layout.
    - **Focus Mode (Zen):** Implemented a distraction-free toggle (shortcut `F`) that collapses the UI chrome (Sidebar/Header) and displays a stabilized **Digital Clock** for deep work sessions.
- **User Personalization:**
    - **Profile Editor:** Integrated a modal to update the User Name, Title/Subtitle, and Profile Picture (upload) directly from the Sidebar.
- **UI/UX Enhancements:**
    - **Settings Drawer:** Replaced inline sidebar controls with a dedicated slide-out panel for Theme, Colors, and Data management, allowing real-time preview of changes without obstructing the view.

### Refactor
- **Sidebar Overhaul:**
    - Completely decoupled navigation from configuration. The Sidebar now focuses on routing, while a new "Settings" action triggers the dedicated drawer.
    - Improved responsive behavior and added a "Live Preview" approach to theming.
--- 

## [0.6.0] - 2025-12-11
### Added

- **Gamification & Goals:**
    - **Activity Goals Box (`ActivityGoalsBox`):** New widget for tracking cumulative metrics (XP, pages read, etc.) with integrated weekly/monthly progress charts.
- **Data Security:**
    - **Full Backup & Restore:** Implemented a robust JSON export/import system in the Sidebar settings. Saves/restores all application state including tasks, themes, and widget configurations.

--- 
## [0.5.0] - 2025-12-10
### Added
- **Global Pomodoro Architecture:**
    - Implementation of `PomodoroManager` and `usePomodoroStore` to decouple timer logic from the Home page.
    - The timer now **persists across navigation** (e.g., moving from Home to Tasks no longer resets the clock).
    - Automatic synchronization of the browser tab title with the remaining time, visible on any route.
- **New Widgets:**
    - **Risk Tracker (`RiskTrackerBox`):** Widget for limit management (e.g., college absences). Supports calculation by percentage (`%`) or absolute units, with visual danger indicators and consequence definitions.
    - **Presence Calendar (`PresenceCalendarBox`):** Specialized calendar to track attendance in recurring events. Allows defining date ranges, specific days of the week, and visually marking Presence/Absence.
- **Update System:** Updated the notification file (`updates.ts`) to reflect the version's new features.

### Changed
- **Smart Layout Engine:**
    - Rewrote the `addBox` logic in `useDashboardStore`. New widgets are now automatically inserted into the shortest available column (lowest Y) instead of being appended to the very bottom of the layout.

---
## [0.4.0] - 2025-12-08
### Added
   - Code Snippets Box: Added a new widget to save recurring commands and code snippets (e.g., Git commands), solving the "forgetting" problem.
   - Quick Links Box: Implemented a tabbed link manager to organize favorites, allowing separation between different contexts (e.g., "Study" vs "Leisure").
   - Enhnced Dark Mode: Improved dark mode compatibility to ensure custom wallpapers (anime backgrounds) remain visible and aesthetically pleasing even when the interface is dark.

### Performance
- **Rendering Optimization**:
    - Refactored `ThemesPage` and `WidgetsStorePage` using `React.memo` and `useShallow` selectors. This eliminates mass re-renders when applying themes or interacting with the store.
    - Switched to imperative state reading (`getState`) for "Save Setup" actions to decouple UI from constant state updates.

### Refactor
- **Smart Embed Box**:
    - **Complete UI overhaul**: Replaced unstable floating menus with a robust Fixed Toolbar.
    - **Zero-Load State**: The widget now initializes empty (no iframe render) to save memory/data until interaction.
    - **Presets System**: Added 3 configurable slots to save quick links and modes (Video/App).
    - **Theming**: Switched to dynamic `current/alpha` colors for perfect integration with any theme.
- **Dashboard Logic**: Updated the `addBox` algorithm to automatically place new widgets in the shortest available column, preventing vertical stacking in the first slot.

---

## [0.3.1] - 2025-12-07
### Performance
- **Critical Rendering Fix:** Resolved a major issue where the Sidebar and Dashboard Header would flicker (re-render) every second while the Pomodoro timer was active.
- **Lazy Loading:** Implemented `React.lazy` and `Suspense` with a custom `BoxLoader` for all dashboard widgets. Widgets now load on-demand, significantly improving initial page load time.
- **Memoization Strategy:** Applied `React.memo` and `useCallback` to `Sidebar`, `ColorButton`, and `DashboardHeader` to ensure UI stability during high-frequency state updates.
- **State Selection:** Integrated `useShallow` from Zustand in critical components to prevent unnecessary re-renders when unrelated store data changes.

### Refactor
- **Store Architecture:** Rewrote `useDashboardStore` using **Immer** middleware for cleaner immutable state updates.
- **Atomic Actions:** Implemented atomic operations (e.g., `removeBox`) within the store to update both `boxes` and `layouts` arrays simultaneously. This prevents "zombie child" crashes when modifying the grid while timers are running.
- **Sidebar Decoupling:** Refactored `Sidebar` to be autonomous (removed dependency on parent props) and isolated the `SidebarCustomizationPanel` to contain its own state logic.
- **Code Cleanup:** Replaced verbose `if/else` logic for widget heights with a constant configuration map (`WIDGET_HEIGHTS`).

---

## [0.3.0] - 2025-12-06
### Added
- **Theme System:**
    - New **Themes Page** (`/themes`) to browse ready-made setups, color palettes, and immersive themes.
    - Added **Personalization Modal** to customize global colors (primary, sidebar, text, box) and background opacity.
    - Support for **Custom Wallpapers** (image upload) and CSS pattern presets (dots, grid, blueprint).
    - **Theme Applicator:** Dynamic CSS variable injection to apply theme changes instantly across the app.
- **Widget Ecosystem:**
    - New **Widgets Store Page** (`/store`) to discover and install new functionalities.
    - **Custom Widget Creator:** Added `WidgetEditorModal` to create custom widgets using HTML/CSS/JS.
    - **New Native Widgets:** `AutomationBox` (If/Then rules), `CountdownBox`, `QuickWorkoutBox`, `SleepTrackerBox`, `CozyLibraryBox`, `MonthlyGoalsBox`, `RpgProfileBox`.
    - **New Embed Widgets:** `SnakeWidget`, `WaterWidget`, (and more).
- **Layout Management:**
    - **Layout Templates:** Feature to save the current dashboard arrangement and theme as a reusable template.
    - **Layout Manager:** New modal to save, load, import, and export (JSON) layout setups.

- **Landing Page:** Added a polished Landing Page (`/intro`) with feature highlights and visual presentations.

### Changed
- **UI/UX Refactor:**
    - Completely redesigned the **Dashboard** to support a flexible grid layout.
    - **Sidebar:** Updated navigation to include links to the new Store and Themes pages.
    - **Global Styles:** Refactored `.box-padrao` and other utility classes to fully support dynamic theming and transparency.


---

## [0.2.0] - 2025-11-28
### Added
- **State Management:** Implementation of **Zustand** for global state management, replacing the Context API completely.
- **Week Planner Feature:** New page (`/planner`) added to organize tasks into cycles/groups (Tagzona) and date ranges.
- **Bulk Editing:** Implemented **BulkEditModal** for editing multiple tasks simultaneously using script format.
- **Single Script Editing:** Added **EditTaskModal** for modifying single tasks via script.
- **Power User Input:**
    - Support for advanced task syntax: `>DURATION`, `>>TIME`, `[TAG]`, and `{GROUP}`.
    - Added quick task creation button to the `BoxTask` on the dashboard.
- **UI & UX:**
    - Redesigned `TaskItem` component with a subtle action menu, conditional time display, and Tagzona badging.

### Changed
- **Architecture:** Complete migration of application state from Context Providers to **Zustand Stores** (`useTaskStore`, etc.).
- **Data Structure:** Updated `Task` type to include the new field `groupTag`.
- **Logic:** `HoursBox` logic updated to calculate progress based only on tasks associated with an active `MetaTagsBox` goal (by Tagzona).
- **UI Layout:** Set new standard dashboard layout (`Home.tsx`) according to user request.
- **Utilities:** Created `TaskParser.ts` for consistent conversion between task objects and text scripts.
- **Chore:** Centralized persistence keys into `storageKeys.ts`.


---

## [0.1.1] - 2025-11-19
### Added
- Button to add multiple tasks at once via textarea.  
- Support for batch input using dash-list format (`- Task description`).  

### Fixed
- `primary` color is now correctly recognized in Tailwind CSS.  
- Fixed `tailwind.config.js` to properly map shadcn/ui theme variables.  

### Changed
- Improved task page UX with a more intuitive form layout.  

---

## [0.1.0] - 2025-09-01
### Added
- Refactored Tailwind setup.  
- Installed and configured Tailwind CSS v3.4.17.  
- Folder structure refactor.  
- Added TypeScript interfaces.  

### Changed
- Removed `@tailwindcss/vite` (only compatible with Tailwind v4).  
- Replaced `tw-animate-css` with `tailwindcss-animate`.