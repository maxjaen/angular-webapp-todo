import { GeneralSettings } from './general-settings';
import { SessionSettings } from './session-settings';
import { TaskSettings } from './task-settings';
import { TimeTaskSettings } from './timetask-settings';

export class Settings {
  id: number;
  general: GeneralSettings;
  task: TaskSettings;
  timetask: TimeTaskSettings;
  session: SessionSettings;
}
