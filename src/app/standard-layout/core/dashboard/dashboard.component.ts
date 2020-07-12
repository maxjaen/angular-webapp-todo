import { Component, OnInit } from "@angular/core";
import { SettingsService } from "../../shared/services/core/settings.service";
import { Settings } from "../settings/model/settings";
import { StartPageSetting } from "../settings/model/start-page-setting";
import { Router } from "@angular/router";
import { TaskService } from "../../shared/services/core/task.service";
import { TimeTaskService } from "../../shared/services/core/timetask.service";
import { TrainingService } from "../../shared/services/core/training.service";
import { WeightService } from "../../shared/services/core/weight.service";
import { Title } from "@angular/platform-browser";
import { TimeService } from "../../shared/services/utils/time.service";

interface KeyValuePair {
  key: string;
  value: string;
}

@Component({
  selector: "app-dashboard.",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  settings: Settings[] = [];

  placeHolderArray: KeyValuePair[] = [];
  ignoreModules: string[] = ["settings", "training", "exercise"];

  constructor(
    public settingsService: SettingsService,
    private taskService: TaskService,
    private timeTaskService: TimeTaskService,
    private trainingService: TrainingService,
    private weightService: WeightService,
    private _tabTitle: Title,
    private _timeService: TimeService,
    private _router: Router
  ) {
    this._tabTitle.setTitle("Home");
  }

  ngOnInit(): void {
    this.getSettingsFromService();
    this.getTaskPlaceholderFromService();
    this.getTimeTaskPlaceholderFromService();
    this.getSessionPlaceholderFromService();
    this.getWeightPlaceholderFromService();
  }

  goToUrl(component: StartPageSetting) {
    this._router.navigate(["/" + component.name]);
  }

  // Get all settings from service
  getSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  getTaskPlaceholderFromService() {
    this.taskService.getAllTasks().subscribe((tasks) => {
      let element: KeyValuePair = {
        key: "tasks",
        value: tasks.filter((task) => task.pinned).length.toString(),
      };

      this.placeHolderArray.push(element);
    });
  }

  getTimeTaskPlaceholderFromService() {
    this.timeTaskService.getAllTimeElements().subscribe((timetasks) => {
      let tempValue = 0;

      if (timetasks.length > 0) {
        tempValue = timetasks
          .filter((e) => {
            let startdate: Date = new Date(e.startdate);
            let today: Date = new Date();

            if (
              startdate.getDate() == today.getDate() &&
              startdate.getMonth() == today.getMonth() &&
              startdate.getFullYear() == today.getFullYear()
            ) {
              return true;
            }
            return false;
          })
          .filter((e) => this.timeTaskService.isValid(e))
          .map(
            (filteredData) =>
              new Date(filteredData.enddate).getTime() -
              new Date(filteredData.startdate).getTime()
          )
          .reduce((a, b) => a + b, 0);
      }

      let element: KeyValuePair = {
        key: "timetask",
        value: this._timeService
          .formatMillisecondsToString(tempValue)
          .toString(),
      };

      this.placeHolderArray.push(element);
    });
  }

  getSessionPlaceholderFromService() {
    this.trainingService.getAllTrainings().subscribe((trainings) => {
      if (trainings.length > 0) {
        let timetrainings = trainings.filter((training) =>
          training.exercices.every(
            (exercise) => exercise.category == "conditionalpattern1d"
          )
        );

        let training = timetrainings[timetrainings.length - 1];

        let element: KeyValuePair = {
          key: "session",
          value: (
            training.exercices
              .map((exercise) => +exercise["repetitions"])
              .reduce((sum, current) => sum + current, 0) +
            5 * training.exercices.length
          ).toString(),
        };
        this.placeHolderArray.push(element);
      }
    });
  }

  getWeightPlaceholderFromService() {
    this.weightService.getAllWeights().subscribe((weights) => {
      if (weights.length > 0) {
        let element: KeyValuePair = {
          key: "weight",
          value: weights[weights.length - 1].value.toString(),
        };

        this.placeHolderArray.push(element);
      }
    });
  }

  getPlaceHolderValueFromKey(key: string) {
    return this.placeHolderArray.filter((e) => e.key == key)[0].value;
  }

  hasPlaceHolder(key: string) {
    return this.placeHolderArray.filter((e) => e.key == key)[0] != undefined;
  }

  isIgnoredModule(str: string) {
    return this.ignoreModules.indexOf(str) > -1;
  }

  replacePlaceholder(word: string, from: string, to: string) {
    return word.replace(from, to);
  }
}
