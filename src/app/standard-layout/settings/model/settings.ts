import { StartPageSetting } from "./start-page-setting";
import { ThemeSetting } from "./theme-setting";

export class Settings {
  id: number;
  startpage: StartPageSetting[];
  theme: ThemeSetting;
}
