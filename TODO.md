# TODO

## High priority: Attention!

- Projects as categories to sort (different sort options)
- Remove `style=...` from html
- Sorting Workouts
- Comments
- Angular linting
- TimerComponent (own

## General

### Angular

- Update Angular Version
- Simplified installation of the app

### New Features

- Notification System with reoccuring tasks
- New Shortcuts, f.e. Enter or Space for scrolling or other use cases
- Tooltip to help user with shortcuts, etc.
- Import and export (e. g. B. PDF) of data
- Authentication [User management (create, edit, delete, . . . ) and generation of tokens, login mask]
- Switch between Dark Theme and White Theme
- Time limits with points and trophy system (productively more points and thus unlock new things)

### Code Refactoring

- remove styles from html
- use more 'const' instead of 'let'
- use more typescript interfaces
- private/public for methods and servcies
- no real naming convention for services
- put services into own folder

### Fix

- Reduce "get" queries
- Reset the input field when creating new Exercise
- Error in "enable history" settings
- Services are bound although not shared
- Adjust timer

<br>

<br>

## For each area

### Settings

- There are still functions not working

### Services

- DayTimeService
  - runs parallel to the application and displays different things depending on the time of day
- MotivationService
  - post motivating sayings
- MeditationService

### Tasks/Timetasks

- Copy a task
- Mark favorites from Tasks/Timetasks
- Color marking of tasks by selection in menu (Npm Colorpicker for Tasks)
- Append files/images to task
- Drag and drop of tasks
- Persistence of the task order (sorting by ID?) - Summary of tasks
- Delete certain tasks from Overalltime, e. g. B. Standups
- 'Random taskchooser with animation - random selection of a task for processing'
- Number of completed task today
- Delete task attribute from Timetask? - Sorting the timetasks
- Delete all archived tasks
- Subcategories for Tasks
- New button for edit task
- `Delete all` button for "history elements"

### Training

- Statistics

  - Show number of trainings (e. g. (e. g. total, for a period of time)
  - Statistics on how long it's been since the last training
  - Number of exercises within a training (diversification)

- Others
  - Change the order of training
  - `CompareView` for trainings
  - Overview in weeks of training
  - Intelligent training suggestions
  - Name for trainings

### Exercises

- `CompareView` for exercises

### Sessions

- Start with exercise in session
- Create new Training from selected Session
- Show training when clicking session

### Weigts

- Difference in weight +-
- Changing the weight time
