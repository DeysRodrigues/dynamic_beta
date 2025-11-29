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