/** GENERAL */

export enum Color {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  CYAN = 'cyan',
  WHITE = 'white',
  PURPLE = 'purple',
  GRAY = 'gray'
}

/** TASKS */

export enum View {
  PROJECTS,
  PINS,
}

export enum Period {
  TODAY,
  HISTORY,
}

/** TRAINING */

export enum Pattern {
  FREE,
  WEIGHT,
  COUNTABLE,
  CONDITIONAL1,
  CONDITIONAL2,
}

export enum TrainingType {
  GYM,
  HOME,
  OUTSIDE
}

export enum TrainingSession {
  STANDARD,
  TIME
}

/** WORKOUT SESSION */

export enum SessionState {
  INITIAL,
  STARTED,
  STOPPED,
}
