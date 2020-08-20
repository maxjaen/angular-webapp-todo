import { startPageSetting } from './start-page-setting';
import { ThemeSetting } from './theme-setting';

export class Settings {
  id: number;
  startPage: startPageSetting[];
  theme: ThemeSetting;
}
