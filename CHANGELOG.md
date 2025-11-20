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
  - Zustand implemented for global state management  
  - Well-defined interfaces (e.g., Task, User, Tag, etc.)  
  - Architecture considered “ready” for real use  

---

## [1.0.0] - Unreleased
### Planned
- Full refactor applying Clean Code principles.  
- Implementation of Zustand for global state management.  
- Creation of strong interfaces and types for the entire system.  

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

---